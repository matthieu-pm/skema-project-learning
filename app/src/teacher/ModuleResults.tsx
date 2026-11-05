import { useState } from "react";
import { Badge, Button, Panel, Select, TextField, useWorkspace } from "./components";
import { canReviewBlock, feedbackStorageKey, moduleResults, readFeedback, shareModuleFeedback, type FeedbackBook } from "./module-results";
import "./module-results.css";

export default function ModuleResults({ studentId }: { studentId: string }) {
  const results = moduleResults.filter((result) => result.studentId === studentId);
  const [selected, setSelected] = useState(results[0]?.id || "");
  const [initial] = useState(() => {
    try { return { book: readFeedback(localStorage), error: "" }; }
    catch { return { book: {} as FeedbackBook, error: "Saved feedback could not be loaded. Reload this page to retry. Your existing saved data has not been changed." }; }
  });
  const [book, setBook] = useState(initial.book);
  const [error, setError] = useState(initial.error);
  const [message, setMessage] = useState("");
  const { offline } = useWorkspace();
  const result = results.find((r) => r.id === selected) || results[0];
  const save = (next: FeedbackBook, success: string) => {
    try {
      if (initial.error) { setError(initial.error); return false; }
      localStorage.setItem(feedbackStorageKey, JSON.stringify(next));
      setBook(next); setError(""); setMessage(success);
      return true;
    } catch {
      setError("Feedback could not be saved in this browser. Keep this page open and try Save feedback again.");
      setMessage("");
      return false;
    }
  };
  if (!result) return <Panel><h2>No completed blocks yet</h2><p>Completed blocks and student responses will appear here, ready for your feedback.</p><p className="mr-muted">This prototype uses sample submissions. New lessons do not generate student results automatically.</p></Panel>;
  const rows = book[result.id] || {};
  const reviewable = result.blocks.filter(canReviewBlock);
  const pending = reviewable.filter((b) => rows[b.id]?.draft.trim() && rows[b.id]?.draft.trim() !== rows[b.id]?.shared).length;
  const shared = reviewable.filter((b) => rows[b.id]?.shared).length;
  return <div className="mr-results">
    <Panel>
      <div className="mr-heading"><Badge tone="lilac">Sample student work</Badge><span>{result.completedAt}</span></div>
      <Select label="Completed module" value={result.id} onChange={(id) => { setSelected(id); setMessage(""); }} options={results.map((r) => ({ value: r.id, label: `${r.type} · ${r.module}` }))} />
      <h2>{result.module}</h2><p>{result.lesson} · {result.blocks.length} completed blocks</p>
      <p className="mr-muted">Review each response and add feedback below. Drafts stay private in this browser. Sharing is simulated.</p>
    </Panel>
    {result.blocks.map((block, index) => {
      const feedback = rows[block.id] || { draft: "" };
      const changed = feedback.draft.trim() !== feedback.shared;
      return <Panel key={`${result.id}-${block.id}`} className="mr-block">
        <div className="mr-heading"><span>Block {index + 1} · {block.type}</span><Badge tone="green">Completed</Badge></div>
        <h2>{block.title}</h2>
        <div className="mr-content"><h3>Block content</h3><p>{block.prompt}</p></div>
        <div className="mr-response"><h3>Student response</h3>
          {block.recording ? <><p className="mr-recording">Voice response · {block.recording.seconds} seconds</p><p className="mr-muted">Sample transcript · audio playback is not available in this prototype.</p><p>{block.recording.transcript}</p></> : <p>{block.response || "Viewed this teaching block. No answer was required."}</p>}
          {block.answer && <><p className={`mr-evaluation ${block.correct ? "correct" : "incorrect"}`}>{block.correct ? "✓ Correct" : "✕ Incorrect"}</p><h3>Teacher-provided answer</h3><p>{block.answer}</p></>}
          {!block.answer && (block.response || block.recording) && <Badge tone="orange">Teacher review</Badge>}
        </div>
        {canReviewBlock(block) && <>
        <TextField label={`Feedback · ${block.title}`} multiline value={feedback.draft} placeholder="What went well? What should the student try next?" onChange={(draft) => {
          const next = { ...book, [result.id]: { ...rows, [block.id]: { ...feedback, draft } } };
          setBook(next);
          save(next, "Feedback draft saved in this browser.");
        }} />
        <p className="mr-muted">{feedback.shared ? (changed ? "Edited draft · previous feedback shared in preview" : "Shared in preview") : "Private draft · not shared"}</p>
        {feedback.shared && changed && <details><summary>Previously shared feedback</summary><p className="mr-preserve">{feedback.shared}</p></details>}
        </>}
      </Panel>;
    })}
    <Panel className="mr-feedback-actions">
      <h2>Feedback for this module</h2>
      <p>{pending} {pending === 1 ? "block has" : "blocks have"} feedback ready to share · {shared} shared in preview</p>
      {error && <p role="alert" className="mr-error">{error}</p>}
      <p role="status" aria-live="polite">{message}</p>
      <div className="tw-actions">
        <Button kind="secondary" disabled={!!initial.error} onClick={() => save(book, "Feedback saved in this browser. Nothing has been shared.")}>Save feedback</Button>
        <Button disabled={!pending || !!initial.error} onClick={() => {
          if (offline) { setError("Connection unavailable. Your feedback draft is kept. Reconnect in Account settings, then try sharing again."); return; }
          save(shareModuleFeedback(result, book, new Date().toISOString()), "Feedback shared in preview. No real student was notified.");
        }}>Share feedback (preview)</Button>
      </div>
    </Panel>
  </div>;
}
