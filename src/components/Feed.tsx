import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import QuizCard from "./QuizCard";
import AnimatedList from "./AnimatedList";
import Modal from "./Modal";
import { generateQuiz } from "../services/quizService";
import { generateSummary } from "../services/summaryService";
import "./Feed.css";

function Feed() {
  const location = useLocation();
  const state = location.state as { content?: string };
  const content = state?.content || "No content provided";

  const [chunks, setChunks] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<any[][]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeChunkIdx, setActiveChunkIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<"quiz" | "summary" | null>(null);

  useEffect(() => {
    setChunks(chunkText(content, 300));
    setQuizzes([]);
  }, [content]);

  const handleLoadQuiz = async (chunk: string, idx: number) => {
    setMode("quiz");
    setActiveChunkIdx(idx);
    setSummary(null);
    setModalOpen(true);

    if (quizzes[idx]?.length) return;

    setQuizzes((prev) => {
      const updated = [...prev];
      updated[idx] = [{ loading: true }];
      return updated;
    });

    const quizArr = await generateQuiz(chunk);
    setQuizzes((prev) => {
      const updated = [...prev];
      updated[idx] = quizArr;
      return updated;
    });
  };

  const handleSummarize = async (chunk: string, idx: number) => {
    setMode("summary");
    setActiveChunkIdx(idx);
    setSummary("⏳ Generating summary...");
    setModalOpen(true);

    const result = await generateSummary(chunk);
    setSummary(result);
  };

  return (
    <main className="feed-layout">
      {/* Sidebar: Actions */}
      <aside className="feed-sidebar left">
        <h3>⚡ Actions</h3>
        <AnimatedList
          items={["Summarize", "Generate Quiz", "Flashcards"]}
          onItemSelect={(item: string) => {
            if (!chunks.length) return;
            const idx = activeChunkIdx ?? 0; // default to first chunk
            if (item === "Summarize") handleSummarize(chunks[idx], idx);
            if (item === "Generate Quiz") handleLoadQuiz(chunks[idx], idx);
            if (item === "Flashcards") console.log("⚡ TODO: Flashcards");
          }}
        />
      </aside>

      {/* Main Content */}
      <section className="feed-page">
        <div className="feed-header">
          <h1>Study Feed</h1>
          <p className="subtitle">Interactive learning as you scroll 📖</p>
        </div>
        <div className="feed-content">
          {chunks.map((chunk, idx) => (
            <div
              key={idx}
              className={`feed-chunk ${activeChunkIdx === idx ? "active" : ""}`}
              onClick={() => setActiveChunkIdx(idx)}
            >
              <p>{chunk}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {mode === "quiz" && activeChunkIdx !== null && (
          <div>
            <h2>Quiz for this section</h2>
            {quizzes[activeChunkIdx]?.[0]?.loading && <p>⏳ Generating quiz...</p>}
            {quizzes[activeChunkIdx] &&
              !quizzes[activeChunkIdx][0]?.loading &&
              quizzes[activeChunkIdx].map((quiz, qIdx) => (
                <QuizCard key={qIdx} {...quiz} />
              ))}
          </div>
        )}
        {mode === "summary" && (
          <div>
            <h2>Summary</h2>
            <p>{summary}</p>
          </div>
        )}
      </Modal>
    </main>
  );
}

function chunkText(content: string, chunkSize = 300) {
  const words = content.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

export default Feed;
