import { useContext, useEffect, useId, useRef, useState } from "react";
import { accepts, answerKey, autoAssessed, type CourseBlock } from "../teacher/course";
import { useKeyboard, useKeyboardInsets } from "../mobile";
import { Button, Field, LearnerPresentation, Select } from "./components";
import { preparationAnswerLimit, preparationBlockComplete } from "./preparation";
import "./preparation-activity.css";

export type PreparationActivityProps = {
  block: CourseBlock;
  language: string;
  answers: Record<string, string>;
  completed: boolean;
  busy: boolean;
  onChange: (answers: Record<string, string>) => void;
  onComplete: () => void;
};

const languageTags: Record<string, string> = {
  French: "fr-FR", English: "en-GB", Spanish: "es-ES",
  German: "de-DE", Italian: "it-IT", Japanese: "ja-JP",
};

function useReadAloud(blockId: string, language: string) {
  const [reading, setReading] = useState("");
  const [error, setError] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const stop = () => {
    if (utteranceRef.current) {
      utteranceRef.current = null;
      window.speechSynthesis.cancel();
    }
    setReading("");
  };
  useEffect(() => {
    setReading("");
    setError("");
    return () => {
      if (utteranceRef.current) {
        utteranceRef.current = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [blockId]);
  const read = (id: string, text: string) => {
    if (!supported) return;
    if (reading === id) { stop(); return; }
    stop();
    setError("");
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = languageTags[language] || language;
    const finish = () => {
      if (utteranceRef.current !== utterance) return;
      utteranceRef.current = null;
      setReading("");
    };
    utterance.onend = finish;
    utterance.onerror = () => {
      if (utteranceRef.current !== utterance) return;
      finish();
      setError("Read aloud could not start. You can read the text below.");
    };
    utteranceRef.current = utterance;
    setReading(id);
    try { window.speechSynthesis.speak(utterance); }
    catch {
      finish();
      setError("Read aloud could not start. You can read the text below.");
    }
  };
  return { supported, reading, error, read, stop };
}

function objectiveAnswers(block: CourseBlock, answers: Record<string, string>) {
  if (!autoAssessed(block)) return [];
  if (["Vocabulary recall", "Flashcards"].includes(block.format)) {
    return block.words.map((word, index) => ({
      id: word.id, prompt: word.meaning, value: answers[word.id] || "",
      expected: answerKey(block, index), alternatives: block.alternatives,
    }));
  }
  if (["Matching pairs", "Word sorting"].includes(block.format)) {
    return block.pairs.map(pair => ({
      id: pair.id, prompt: pair.left, value: answers[pair.id] || "",
      expected: pair.right, alternatives: "",
    }));
  }
  return [{ id: block.id, prompt: "Your answer", value: answers.response || "", expected: answerKey(block), alternatives: block.alternatives }];
}

export default function PreparationActivity({ block, language, answers, completed, busy, onChange, onComplete }: PreparationActivityProps) {
  const headingId = useId();
  const activityRef = useRef<HTMLElement>(null);
  const mobile = useContext(LearnerPresentation);
  const { focusedElement } = useKeyboard();
  const { isKeyboardVisible, keyboardHeight } = useKeyboardInsets();
  const narration = useReadAloud(block.id, language);
  useEffect(() => {
    const activity = activityRef.current;
    if (!mobile || !isKeyboardVisible || !focusedElement || !activity?.contains(focusedElement)) return;
    const scroll = activity.closest<HTMLElement>(".mobile-scroll");
    if (!scroll) return;
    const footer = scroll.closest(".flow-stack")?.querySelector<HTMLElement>(".flow-fixed-footer");
    let frame = 0;
    const reveal = () => {
      frame = 0;
      if (document.activeElement !== focusedElement || !activity.contains(focusedElement)) return;
      const viewport = scroll.getBoundingClientRect();
      if (!viewport.height) return;
      const cssPerPixel = scroll.clientHeight / viewport.height;
      const margin = 12 / cssPerPixel;
      const top = viewport.top + margin;
      const bottom = Math.min(viewport.bottom, footer?.getBoundingClientRect().top ?? viewport.bottom) - margin;
      const field = focusedElement.getBoundingClientRect();
      // Oversized textareas keep their start visible; their own caret scrolling
      // handles content that cannot fit in the available app viewport.
      const delta = field.height > bottom - top ? field.top - top
        : field.bottom > bottom ? field.bottom - bottom
        : field.top < top ? field.top - top : 0;
      if (Math.abs(delta) > .5) scroll.scrollTop += delta * cssPerPixel;
    };
    const queueReveal = () => { if (!frame) frame = requestAnimationFrame(reveal); };
    const observer = new ResizeObserver(queueReveal);
    observer.observe(scroll);
    observer.observe(focusedElement);
    const content = scroll.querySelector(".mobile-scroll-content");
    if (content) observer.observe(content);
    // MobileScroll animates its viewport as the keyboard opens. Observing that
    // viewport keeps the field revealed through the final animation frame.
    queueReveal();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [mobile, isKeyboardVisible, keyboardHeight, focusedElement, block.id]);
  const practice = block.purpose === "Practice";
  const words = ["Vocabulary recall", "Flashcards"].includes(block.format);
  const pairs = ["Matching pairs", "Word sorting"].includes(block.format);
  const sentence = block.format === "Sentence construction";
  const audio = block.format === "Audio";
  const canComplete = preparationBlockComplete(block, answers);
  const results = completed ? objectiveAnswers(block, answers).filter(result => result.expected.trim()) : [];
  const change = (key: string, value: string) => { if (!busy) onChange({ ...answers, [key]: value }); };
  const readButton = (id: string, text: string) => (
    <Button secondary static disabled={busy || !narration.supported || !text.trim()} onClick={() => narration.read(id, text)}>
      {narration.reading === id ? "Stop reading" : "Read aloud"}
    </Button>
  );
  return (
    <section ref={activityRef} className="preparation-activity" aria-labelledby={headingId} aria-busy={busy}>
      <header className="lpa-heading">
        <p className="lpa-meta">{practice ? "Practice" : "Learn"} <span aria-hidden="true">·</span> {block.format}</p>
        <h2 id={headingId}>{block.title}</h2>
        {block.instructions && <p className="lpa-instructions">{block.instructions}</p>}
      </header>

      {!practice && words && <div className="lpa-flashcards">
        {block.words.map(word => <article className="lpa-flashcard" key={word.id}>
          <h3 lang={languageTags[language] || language}>{word.word}</h3>
          <p>{word.meaning}</p>
          {word.pronunciation && <p className="lpa-pronunciation">Pronunciation: <span lang={languageTags[language] || language}>{word.pronunciation}</span></p>}
          {readButton(word.id, word.pronunciation || word.word)}
        </article>)}
      </div>}

      {!practice && sentence && <div className="lpa-sentence">
        <ol className="lpa-sentence-parts" aria-label="Sentence parts">
          {block.parts.map(part => <li key={part.id}>
            <strong lang={languageTags[language] || language}>{part.text}</strong>
            {part.role && <span className="lpa-part-role">{part.role}</span>}
            {part.note && <span className="lpa-part-note">{part.note}</span>}
          </li>)}
        </ol>
        {block.translation && <p className="lpa-translation">{block.translation}</p>}
      </div>}

      {audio && <div className="lpa-clips">
        {block.clips.map(clip => <article className="lpa-transcript" key={clip.id}>
          <div className="lpa-transcript-heading"><h3>{clip.title || "Listen and read"}</h3>{readButton(clip.id, [clip.transcript, clip.answer].filter(Boolean).join("\n"))}</div>
          <span className="lpa-text-label">Transcript</span>
          <p lang={languageTags[language] || language}>{clip.transcript}</p>
          {clip.answer && <><span className="lpa-text-label">Customer’s response</span><p lang={languageTags[language] || language}>{clip.answer}</p></>}
        </article>)}
      </div>}

      {!words && !pairs && !sentence && !audio && block.text && <div className="lpa-reading"><p>{block.text}</p></div>}

      {practice && <fieldset className="lpa-inputs" disabled={busy} inert={busy} aria-label="Your answers">
        {words ? block.words.map(word => <div className="lpa-recall-item" key={word.id}>
          <div className="lpa-recall-prompt">
            {word.meaning === "a coffee" && <img src="/assets/lessons/cafe-coffee.svg" alt="" aria-hidden="true" draggable={false} />}
            <span>{word.meaning}</span>
          </div>
          <Field label={`What is “${word.meaning}” in ${language}?`} value={answers[word.id] || ""}
            onChange={value => change(word.id, value)} maxLength={preparationAnswerLimit} />
        </div>)
          : pairs ? block.pairs.map(pair => <Select key={pair.id} label={pair.left}
            value={answers[pair.id] || "Choose a match"} options={["Choose a match", ...[...new Set(block.pairs.map(item => item.right))].reverse()]}
            onChange={value => change(pair.id, value === "Choose a match" ? "" : value)} />)
          : <>
            {sentence && <>
              <p className="lpa-hint">Use these words to build your sentence.</p>
              <ul className="lpa-word-bank" aria-label="Words to use">{[...block.parts].reverse().map(part => <li key={part.id}>{part.text}</li>)}</ul>
              {block.translation && <p className="lpa-translation">{block.translation}</p>}
            </>}
            {block.format === "Spoken response" && <p className="lpa-hint">Practice your answer aloud, then write what you would say.</p>}
            <Field label={block.format === "Spoken response" ? "What would you say?" : block.format === "Written response" ? "Your response" : "Your answer"}
              value={answers.response || ""} onChange={value => change("response", value)}
              multiline={["Written response", "Spoken response"].includes(block.format)} maxLength={preparationAnswerLimit} />
          </>}
      </fieldset>}

      {(audio || (!practice && words)) && !narration.supported && <p className="lpa-hint">Read aloud is unavailable in this browser.</p>}
      {narration.error && <p className="lpa-hint" role="status">{narration.error}</p>}

      {completed && <section className="lpa-result" aria-label={results.length ? "Answer-key result" : "Activity completion"} role="status">
        {results.length ? <>
          <h3>Answer-key result</h3>
          <ul>{results.map(result => {
            const correct = accepts(result.value, result.expected, result.alternatives);
            return <li key={result.id}>
              <p className="lpa-result-verdict"><span aria-hidden="true">{correct ? "✓" : "−"}</span><strong>{correct ? "Matches the answer key" : "Does not match the answer key"}</strong></p>
              <p>{result.prompt}: <span>{result.value}</span></p>
              <p className="lpa-expected">Expected answer: <strong>{result.expected}</strong></p>
            </li>;
          })}</ul>
        </> : <p>{practice ? "Activity completed." : "Marked as read."}</p>}
      </section>}

      <div className="lpa-actions">
        <Button disabled={busy || completed || !canComplete} onClick={() => { if (!busy && !completed && canComplete) { narration.stop(); onComplete(); } }}>
          {busy ? "Saving…" : completed ? "Completed" : practice ? "Complete activity" : "Mark as read"}
        </Button>
        {practice && completed && <p className="lpa-hint">Edit an answer above to try again.</p>}
      </div>
    </section>
  );
}
