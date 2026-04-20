import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, Zap, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "../../shared/components/UI";
import {
  getAiAssistantBootstrap,
  sendAiChatMessage,
} from "../../services/apiClient";

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [error, setError] = useState("");
  const [bootstrapWarning, setBootstrapWarning] = useState("");
  const bottomRef = useRef(null);

  const fetchInitialData = async () => {
    setBootstrapping(true);

    try {
      const response = await getAiAssistantBootstrap();

      setSuggestions(Array.isArray(response.suggestions) ? response.suggestions : []);
      setCapabilities(Array.isArray(response.capabilities) ? response.capabilities : []);
      setMessages([
        {
          type: "ai",
          text: response.welcomeMessage,
        },
      ]);
      setBootstrapWarning(
        response.partialData ? "Some assistant metadata could not be loaded." : "",
      );
      setError("");
    } catch (loadError) {
      console.error("Error fetching AI assistant bootstrap:", loadError);
      setSuggestions([]);
      setCapabilities([]);
      setMessages([]);
      setBootstrapWarning("");
      setError("Failed to load the AI assistant.");
    } finally {
      setBootstrapping(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callBackendAI = async (userMessage) => {
    setLoading(true);

    try {
      const data = await sendAiChatMessage(userMessage);
      return data.reply || data.message || "I received your message but couldn't process it.";
    } catch (chatError) {
      console.error("AI API error:", chatError);
      return "I'm having trouble connecting. Please try again in a moment.";
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (nextMessage = input) => {
    const text = nextMessage.trim();
    if (!text || loading || bootstrapping) return;

    setInput("");
    setMessages((currentMessages) => [...currentMessages, { type: "user", text }]);
    const reply = await callBackendAI(text);
    setMessages((currentMessages) => [...currentMessages, { type: "ai", text: reply }]);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  if (bootstrapping) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Loading AI assistant...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={fetchInitialData}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-0 lg:h-[calc(100dvh-9rem)]">
      <div
        className="flex-1 flex flex-col rounded-xl shadow-sm overflow-hidden min-h-[min(70dvh,32rem)] lg:min-h-0 border border-slate-200"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
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

        {bootstrapWarning && (
          <div className="px-4 py-3 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
            {bootstrapWarning}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "ai" && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                  style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
                >
                  <Sparkles size={10} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[min(28rem,85vw)] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.type === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-slate-100 text-slate-800 rounded-tl-sm"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
              >
                <Sparkles size={10} className="text-white" />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${item * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-3 sm:p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
              placeholder="Ask about knowledge, reports, meetings…"
              className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-white disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-64 hidden lg:flex flex-col gap-4 flex-shrink-0">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Capabilities
          </h3>
          <ul className="space-y-2">
            {capabilities.map((capability, index) => (
              <li
                key={`${capability}-${index}`}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                {capability}
              </li>
            ))}
            {capabilities.length === 0 && (
              <li className="text-xs text-slate-400">No capabilities available.</li>
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Suggested Prompts</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left text-xs p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition text-slate-600"
              >
                {suggestion}
              </button>
            ))}
            {suggestions.length === 0 && (
              <p className="text-xs text-slate-400">No prompt suggestions available.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
