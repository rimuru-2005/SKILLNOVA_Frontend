import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, Zap, CheckCircle } from "lucide-react";
import { Card } from "../../shared/components/UI";
import { request } from "../../services/api";

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all data in parallel
        const [suggestionsRes, capabilitiesRes, welcomeRes] = await Promise.all(
          [
            // API CALL
            request("/suggestions"),
            request("/capabilities"),
            request("/welcome-message"),
          ],
        );

        if (!suggestionsRes.ok) throw new Error("Failed to fetch suggestions");
        if (!capabilitiesRes.ok)
          throw new Error("Failed to fetch capabilities");
        if (!welcomeRes.ok) throw new Error("Failed to fetch welcome message");

        const suggestionsData = await suggestionsRes.json();
        const capabilitiesData = await capabilitiesRes.json();
        const welcomeData = await welcomeRes.json();

        setSuggestions(suggestionsData.data || suggestionsData);
        setCapabilities(capabilitiesData.data || capabilitiesData);
        setMessages([
          {
            type: "ai",
            text: welcomeData.message || "Hello! How can I help you today?",
          },
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load. Please refresh the page.");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callBackendAI = async (userMessage) => {
    setLoading(true);
    try {
      // API CALL 
      const response = await request("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      return (
        data.reply ||
        data.message ||
        "I received your message but couldn't process it."
      );
    } catch (error) {
      console.error("AI API error:", error);
      return "I'm having trouble connecting. Please try again in a moment.";
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { type: "user", text }]);
    const reply = await callBackendAI(text);
    setMessages((m) => [...m, { type: "ai", text: reply }]);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-0 lg:h-[calc(100dvh-9rem)]">
      {/* Chat Panel */}
      <div
        className="flex-1 flex flex-col rounded-xl shadow-sm overflow-hidden min-h-[min(70dvh,32rem)] lg:min-h-0 border border-slate-200"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >

        {/* Chat header */}
        <div className="px-4 sm:px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <div
            className="p-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
          >
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">AI Knowledge Assistant</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              {msg.type === "ai" && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                  style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
                >
                  <Sparkles size={10} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[min(28rem,85vw)] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-slate-100 text-slate-800 rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                <Sparkles size={10} className="text-white" />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask about knowledge, reports, meetings…"
              className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-white disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Dynamic data from backend */}
      <div className="w-64 hidden lg:flex flex-col gap-4 flex-shrink-0">

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Capabilities
          </h3>
          <ul className="space-y-2">
            {capabilities.map((c, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <CheckCircle
                  size={12}
                  className="text-emerald-500 flex-shrink-0"
                />{" "}
                {c}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Suggested Prompts</h3>
          <div className="space-y-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setInput(s)}
                className="w-full text-left text-xs p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition text-slate-600"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AIAssistant;
