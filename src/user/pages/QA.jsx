// ══════════════════════════════════════════════
//  USER — pages/QA.jsx
// ══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { ThumbsUp, MessageCircle, Search, Plus, MessageSquare } from "lucide-react";
import { Card, Badge } from "../../shared/components/UI";
import {
  createQaQuestion,
  getQaQuestions,
  upvoteQaQuestion,
} from "../../services/apiClient";

const CATEGORIES = ["All", "Projects", "Reports", "Meetings", "Knowledge Base", "Internship"];

const QA = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadQuestions = async () => {
      const storedQuestions = await getQaQuestions();
      setQuestions(Array.isArray(storedQuestions) ? storedQuestions : []);
    };

    loadQuestions();
  }, []);

  const handleAdd = async () => {
    const title = newQuestion.trim();
    if (!title) return;

    const createdQuestion = await createQaQuestion({
      title,
      category: "Projects",
      author: "You",
    });

    setQuestions((currentQuestions) => [createdQuestion, ...currentQuestions]);
    setNewQuestion("");
  };

  const handleUpvote = async (id) => {
    const updatedQuestion = await upvoteQaQuestion(id);
    if (!updatedQuestion) return;

    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === id ? updatedQuestion : question,
      ),
    );
  };

  const filtered = questions.filter(
    (question) =>
      (selectedCategory === "All" || question.category === selectedCategory) &&
      question.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div
        className="relative rounded-2xl overflow-hidden p-5 sm:p-8 text-white shadow-xl mb-6"
        style={{ background: "linear-gradient(135deg, #ff6d34 0%, #ff8c5f 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#fff_1px,transparent_1px),radial-gradient(circle_at_80%_20%,#00bea3_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Intern Management Q&A</h1>
            <p className="opacity-90 mt-2 text-sm">
              Ask questions related to projects, meetings and internship tasks.
            </p>
          </div>
          <Badge variant="default">{questions.length} question{questions.length !== 1 ? "s" : ""}</Badge>
        </div>
      </div>

      <Card className="p-5" delay={0.1}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>Ask a Question</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newQuestion}
            onChange={(event) => setNewQuestion(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-lg focus:outline-none transition"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            placeholder="Write your question…"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="w-full sm:w-auto justify-center px-4 py-2.5 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition flex-shrink-0"
            style={{ background: "#ff6d34" }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "#e85d25";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "#ff6d34";
            }}
          >
            <Plus size={15} /> Post
          </button>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions…"
            className="w-full pl-9 py-2.5 text-sm rounded-lg focus:outline-none transition"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className="px-3 py-2 rounded-lg text-xs font-medium transition"
              style={{
                background: selectedCategory === category ? "#ff6d34" : "var(--card)",
                border:
                  selectedCategory === category
                    ? "1px solid #ff6d34"
                    : "1px solid var(--border)",
                color: selectedCategory === category ? "#ffffff" : "var(--text)",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((question, index) => (
          <Card key={question.id} hover className="p-5" delay={0.2 + index * 0.1}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpvote(question.id)}
                  className="p-1.5 rounded-lg transition"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.color = "#ff6d34";
                    event.currentTarget.style.background = "rgba(255,109,52,0.1)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color = "var(--muted)";
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <ThumbsUp size={15} />
                </button>
                <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                  {question.votes}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold cursor-pointer leading-snug"
                  style={{ color: "var(--text)" }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.color = "#ff6d34";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color = "var(--text)";
                  }}
                >
                  {question.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: "var(--muted)" }}>
                  <Badge variant="gray">{question.category}</Badge>
                  <span>{question.author}</span>
                  <span>{question.time}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={11} /> {question.answers} answer{question.answers !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--muted)" }}>
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>No questions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QA;
