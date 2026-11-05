import { useEffect, useState } from "react";
import { Button, TextField, Select } from "./components";
import {
  accepts,
  answerKey,
  autoAssessed,
  blockIssues,
  type CourseBlock,
  type Clip,
} from "./course";
import { loadMedia, saveMedia } from "./course-storage";

export function useMedia(assetId?: string) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true,
      objectUrl = "";
    setUrl("");
    if (assetId)
      loadMedia(assetId)
        .then((blob) => {
          if (active && blob) {
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
          }
        })
        .catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId]);
  return url;
}
export function MediaUpload({
  label,
  accept,
  onSave,
}: {
  label: string;
  accept: string;
  onSave: (assetId: string, filename: string) => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="ce-upload">
      <label>
        {label}
        <input
          aria-label={label}
          disabled={busy}
          type="file"
          accept={accept}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              const mediaId = await saveMedia(file);
              onSave(mediaId, file.name);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "File could not be saved. Try a smaller file.",
              );
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {busy && <small role="status">Saving file on this device…</small>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function Picture({
  assetId,
  picture,
  alt,
}: {
  assetId?: string;
  picture: string;
  alt: string;
}) {
  const url = useMedia(assetId);
  return url ? (
    <img className="ce-picture" src={url} alt={alt} draggable={false} />
  ) : (
    <div className="ce-picture ce-pictogram" role="img" aria-label={alt}>
      {picture}
    </div>
  );
}
function say(text: string, language: string) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang =
    (
      {
        French: "fr-FR",
        English: "en-GB",
        Spanish: "es-ES",
        German: "de-DE",
        Italian: "it-IT",
        Japanese: "ja-JP",
      } as Record<string, string>
    )[language] || language;
  speechSynthesis.speak(utterance);
}
export function Pronunciation({
  assetId,
  text,
  language,
}: {
  assetId?: string;
  text: string;
  language: string;
}) {
  const url = useMedia(assetId);
  return url ? (
    <audio controls src={url} aria-label={`Pronunciation of ${text}`} />
  ) : (
    <Button kind="secondary" onClick={() => say(text, language)}>
      Hear pronunciation
    </Button>
  );
}
function ClipPlayer({
  clip,
  format,
  language,
  repeat,
}: {
  clip: Clip;
  format: string;
  language: string;
  repeat: boolean;
}) {
  const url = useMedia(clip.assetId),
    [recorded, setRecorded] = useState(false),
    [show, setShow] = useState(false);
  return (
    <section className="ce-clip">
      <strong>{clip.title}</strong>
      {url ? (
        format === "Video" ? (
          <video controls src={url} />
        ) : (
          <audio controls src={url} />
        )
      ) : (
        <>
          <small>Sample playback · generated voice</small>
          <Button
            kind="secondary"
            onClick={() => say(clip.transcript, language)}
          >
            Play sample
          </Button>
        </>
      )}
      {clip.assetId && !url && (
        <small>
          File unavailable on this device. Reattach it in the editor.
        </small>
      )}
      <button className="tw-text-link" onClick={() => setShow(!show)}>
        {show ? "Hide transcript" : "Show transcript"}
      </button>
      {show && <p>{clip.transcript}</p>}
      {repeat && (
        <>
          <p>{clip.answer}</p>
          <Button kind="secondary" onClick={() => say(clip.answer, language)}>
            Hear model answer
          </Button>
          <Button kind="secondary" onClick={() => setRecorded(!recorded)}>
            {recorded
              ? "Record sample again"
              : "Repeat after me · record sample"}
          </Button>
          {recorded && (
            <>
              <p role="status">
                Sample response recorded. Microphone capture is simulated.
              </p>
              <Button
                kind="secondary"
                onClick={() => say(clip.answer, language)}
              >
                Play sample recording
              </Button>
            </>
          )}
        </>
      )}
    </section>
  );
}
export function BlockSummary({ block: b }: { block: CourseBlock }) {
  if (["Flashcards", "Vocabulary recall", "Useful phrases"].includes(b.format))
    return (
      <div className="ce-word-grid">
        {b.words.map((w) => (
          <div key={w.id} className="ce-word">
            <Picture assetId={w.imageId} picture={w.picture} alt={w.meaning} />
            <strong>{w.word}</strong>
            <span>{w.meaning}</span>
          </div>
        ))}
      </div>
    );
  if (b.format === "Sentence construction")
    return (
      <>
        <div className="ce-parts">
          {b.parts.map((p) => (
            <div className="ce-part" key={p.id}>
              <small>{p.role}</small>
              <strong>{p.text}</strong>
              <span>{p.note}</span>
            </div>
          ))}
        </div>
        <p>{b.translation}</p>
      </>
    );
  if (["Matching pairs", "Word sorting"].includes(b.format))
    return (
      <div className="ce-pair-grid">
        {b.pairs.map((p) => (
          <div key={p.id}>
            <span>{p.left}</span>
            <span>{p.right}</span>
          </div>
        ))}
      </div>
    );
  if (["Audio", "Video"].includes(b.format))
    return (
      <div className="ce-clip-list">
        {b.clips.map((c, i) => (
          <div key={c.id}>
            <span className="ce-number">{i + 1}</span>
            <strong>{c.title}</strong>
            <span>{c.filename || "Sample audio"}</span>
          </div>
        ))}
      </div>
    );
  if (b.format === "Image")
    return (
      <>
        <Picture assetId={b.assetId} picture={b.picture} alt={b.text} />
        <p>{b.text}</p>
      </>
    );
  return (
    <>
      <p className="ce-reading">{b.text}</p>
      {b.format === "Quiz" && (
        <div className="ce-choices">
          {b.choices.map((c, i) => (
            <span key={i}>
              {String.fromCharCode(65 + i)} · {c}
            </span>
          ))}
        </div>
      )}
      {b.filename && <small>{b.filename}</small>}
    </>
  );
}
function DocumentContent({ block: b }: { block: CourseBlock }) {
  const url = useMedia(b.assetId);
  return (
    <>
      <p className="ce-reading">{b.text}</p>
      {url && (
        <a className="tw-text-link" href={url} target="_blank" rel="noreferrer">
          Open {b.filename || "document"}
        </a>
      )}
      {b.assetId && !url && (
        <p>Document unavailable on this device. Ask your teacher for a copy.</p>
      )}
    </>
  );
}

export function StudentBlock({
  block: b,
  language,
}: {
  block: CourseBlock;
  language: string;
}) {
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    },
    [],
  );
  const [index, setIndex] = useState(0),
    [flip, setFlip] = useState(false),
    [input, setInput] = useState(""),
    [values, setValues] = useState<Record<string, string>>({}),
    [order, setOrder] = useState<string[]>([]),
    [submitted, setSubmitted] = useState(false),
    [revealed, setRevealed] = useState(false),
    [sent, setSent] = useState(false),
    [recorded, setRecorded] = useState(false);
  const reset = () => {
    setInput("");
    setValues({});
    setOrder([]);
    setSubmitted(false);
    setRevealed(false);
  };
  const isWords = ["Flashcards", "Vocabulary recall"].includes(b.format),
    isPairs = ["Matching pairs", "Word sorting"].includes(b.format),
    isSentence = b.format === "Sentence construction";
  const response = isSentence
    ? order.map((pid) => b.parts.find((p) => p.id === pid)?.text).join(" ")
    : input;
  const complete = isPairs
    ? b.pairs.every((p) => values[p.id]?.trim())
    : isSentence
      ? order.length === b.parts.length
      : !!response.trim();
  const correct = isPairs
    ? b.pairs.every((p) => accepts(values[p.id] || "", p.right))
    : accepts(response, answerKey(b, index), b.alternatives);
  const issues = blockIssues(b),
    auto = autoAssessed(b),
    current = b.words[index];
  const choices = [...new Set(b.pairs.map((p) => p.right))].reverse();
  return (
    <div className="ce-student-block">
      <span className="ce-kicker">
        {b.purpose === "Teach" ? "Learn" : "Practise"} · {b.format}
      </span>
      <h2>{b.title}</h2>
      <p>{b.instructions}</p>
      {issues.length > 0 ? (
        <div role="alert" className="ce-warning">
          This block needs teacher input before it can be tried.
          <ul>
            {issues.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {isWords && current && (
            <div className="ce-flashcard">
              <small>
                Card {index + 1} of {b.words.length}
              </small>
              <Picture
                assetId={current.imageId}
                picture={current.picture}
                alt={current.meaning}
              />
              <h3>{b.purpose === "Teach" ? current.word : current.meaning}</h3>
              {b.purpose === "Teach" && (
                <>
                  <Pronunciation
                    assetId={current.assetId}
                    text={current.pronunciation || current.word}
                    language={language}
                  />
                  <Button kind="secondary" onClick={() => setFlip(!flip)}>
                    {flip ? "Hide meaning" : "Reveal meaning"}
                  </Button>
                  {flip && <p>{current.meaning}</p>}
                </>
              )}
            </div>
          )}
          {b.format === "Useful phrases" &&
            b.words.map((w) => (
              <div className="ce-clip" key={w.id}>
                <strong>{w.word}</strong>
                <p>{w.meaning}</p>
                <Pronunciation
                  assetId={w.assetId}
                  text={w.pronunciation || w.word}
                  language={language}
                />
              </div>
            ))}
          {b.purpose === "Teach" && isSentence && <BlockSummary block={b} />}
          {["Audio", "Video"].includes(b.format) &&
            b.clips.map((c) => (
              <ClipPlayer
                key={c.id}
                clip={c}
                format={b.format}
                language={language}
                repeat={b.format === "Audio"}
              />
            ))}
          {b.format === "Image" && (
            <Picture assetId={b.assetId} picture={b.picture} alt={b.text} />
          )}
          {![
            "Flashcards",
            "Vocabulary recall",
            "Useful phrases",
            "Sentence construction",
            "Audio",
            "Video",
            "Matching pairs",
            "Word sorting",
          ].includes(b.format) && <DocumentContent block={b} />}
          {auto && (
            <div className="ce-response">
              <fieldset disabled={submitted} aria-label="Your answer">
                {isPairs ? (
                  b.pairs.map((p) => (
                    <Select
                      key={p.id}
                      label={p.left}
                      value={values[p.id] || ""}
                      options={[
                        {
                          value: "",
                          label:
                            b.format === "Word sorting"
                              ? "Choose a group"
                              : "Choose a match",
                        },
                        ...choices,
                      ]}
                      onChange={(v) => setValues({ ...values, [p.id]: v })}
                    />
                  ))
                ) : isSentence ? (
                  <>
                    <div className="ce-answer-tiles" aria-label="Your sentence">
                      {order.map((pid, i) => (
                        <button
                          key={pid}
                          onClick={() =>
                            setOrder(order.filter((_, j) => j !== i))
                          }
                        >
                          {b.parts.find((p) => p.id === pid)?.text} ×
                        </button>
                      ))}
                      {!order.length && (
                        <small>Tap words below to build your sentence.</small>
                      )}
                    </div>
                    <div className="ce-tiles">
                      {[...b.parts].reverse().map((p) => (
                        <button
                          key={p.id}
                          disabled={order.includes(p.id) || submitted}
                          onClick={() => setOrder([...order, p.id])}
                        >
                          {p.text}
                        </button>
                      ))}
                    </div>
                  </>
                ) : b.format === "Quiz" ? (
                  <div className="ce-radio-list">
                    {b.choices.map((c, i) => (
                      <label key={i}>
                        <input
                          type="radio"
                          name={b.id}
                          checked={input === c}
                          onChange={() => setInput(c)}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                ) : (
                  <TextField
                    label={
                      isWords
                        ? `What is “${current?.meaning}” in ${language}?`
                        : "Your answer"
                    }
                    value={input}
                    onChange={setInput}
                  />
                )}
              </fieldset>
              {!submitted ? (
                <Button disabled={!complete} onClick={() => setSubmitted(true)}>
                  Submit answer
                </Button>
              ) : (
                <>
                  <Button
                    kind="secondary"
                    onClick={() => setRevealed(true)}
                    disabled={revealed}
                  >
                    Reveal answer
                  </Button>
                  <button
                    className="tw-text-link"
                    onClick={() => {
                      setSubmitted(false);
                      setRevealed(false);
                    }}
                  >
                    Edit submitted answer
                  </button>
                </>
              )}
              {!submitted && (
                <small>
                  Submit your answer before revealing the teacher’s answer.
                </small>
              )}
              {revealed && (
                <div
                  role="status"
                  className={`ce-result ${correct ? "correct" : "incorrect"}`}
                >
                  <strong>{correct ? "✓ Correct" : "✕ Incorrect"}</strong>
                  {isPairs ? (
                    b.pairs.map((p) => (
                      <p key={p.id}>
                        {accepts(values[p.id] || "", p.right) ? "✓" : "✕"}{" "}
                        {p.left}: {values[p.id]}
                        <br />
                        Teacher’s answer: {p.right}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>Your answer: {response}</p>
                      <p>
                        Teacher’s answer: <strong>{answerKey(b, index)}</strong>
                      </p>
                    </>
                  )}
                  <Button kind="secondary" onClick={reset}>
                    Try again
                  </Button>
                </div>
              )}
            </div>
          )}
          {b.purpose === "Practise" && !auto && (
            <div className="ce-response">
              {["Spoken response", "Role-play"].includes(b.format) ? (
                <>
                  <Button
                    kind="secondary"
                    onClick={() => {
                      setRecorded(!recorded);
                      setSent(false);
                    }}
                  >
                    {recorded
                      ? "Record sample again"
                      : "Record sample response"}
                  </Button>
                  {recorded && (
                    <>
                      <p>
                        Sample recording ready · microphone capture is
                        simulated.
                      </p>
                      <Button
                        kind="secondary"
                        onClick={() =>
                          say("Je voudrais un café, s’il vous plaît.", language)
                        }
                      >
                        Play sample recording
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <TextField
                  multiline
                  label="Your response"
                  value={input}
                  onChange={(v) => {
                    setInput(v);
                    setSent(false);
                  }}
                />
              )}
              <Button
                disabled={
                  sent ||
                  (!["Spoken response", "Role-play"].includes(b.format)
                    ? !input.trim()
                    : !recorded)
                }
                onClick={() => setSent(true)}
              >
                {sent ? "Sent for review" : "Send to teacher for review"}
              </Button>
              {sent && (
                <p role="status">
                  Submitted in this preview. Your teacher would review this
                  response; no automatic grade is given.
                </p>
              )}
            </div>
          )}
          {isWords && (
            <div className="ce-actions">
              <Button
                kind="secondary"
                disabled={index === 0}
                onClick={() => {
                  setIndex(index - 1);
                  setFlip(false);
                  reset();
                }}
              >
                Previous card
              </Button>
              <Button
                kind="secondary"
                disabled={index === b.words.length - 1}
                onClick={() => {
                  setIndex(index + 1);
                  setFlip(false);
                  reset();
                }}
              >
                Next card
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
