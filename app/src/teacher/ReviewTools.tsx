import { useEffect, useRef, useState } from "react";
import { Badge, Button, Select, TextField, useWorkspace } from "./components";
import type { BlockFeedback, CompletedBlock } from "./module-results";
import {
  defaultCriteria,
  formatTime,
  ratings,
  validateAnnotation,
  type Annotation,
  type ReviewDetails,
  type SavedComment,
} from "./review";
import { loadMedia, saveMedia } from "./course-storage";
import { useFlow } from "../mobile";

type VoiceProps = {
  review: ReviewDetails;
  onChange: (r: ReviewDetails) => void;
  onBusyChange?: (busy: boolean) => void;
};
export function VoiceFeedback(props: VoiceProps) {
  const { mobile } = useWorkspace();
  return mobile ? (
    <MobileVoiceFeedback {...props} />
  ) : (
    <VoiceFeedbackControl {...props} />
  );
}
function MobileVoiceFeedback(props: VoiceProps) {
  const flow = useFlow();
  const screen = useRef(flow.current.id);
  return (
    <VoiceFeedbackControl
      {...props}
      active={screen.current === flow.current.id}
    />
  );
}
function VoiceFeedbackControl({
  review,
  onChange,
  onBusyChange,
  active = true,
}: VoiceProps & { active?: boolean }) {
  const isActive = useRef(active);
  isActive.current = active;
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    if (!active) {
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    }
  }, [active]);
  const upload = useRef<HTMLInputElement>(null);
  const busyRef = useRef(onBusyChange);
  busyRef.current = onBusyChange;
  useEffect(() => {
    busyRef.current?.(busy || recording);
    return () => busyRef.current?.(false);
  }, [busy, recording]);
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const reviewRef = useRef(review);
  reviewRef.current = review;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  useEffect(() => {
    let active = true,
      objectUrl = "";
    setUrl("");
    if (review.voiceId)
      loadMedia(review.voiceId)
        .then((blob) => {
          if (!blob) throw new Error("Missing media");
          if (active) {
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
            setError("");
          }
        })
        .catch(() => {
          if (active)
            setError(
              "Voice feedback could not be loaded. Attach the audio again.",
            );
        });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [review.voiceId]);
  async function attach(file: File) {
    setBusy(true);
    setError("");
    try {
      if (!file.type.startsWith("audio/"))
        throw new Error("Choose an audio file.");
      const voiceId = await saveMedia(file);
      if (mounted.current)
        changeRef.current({
          ...reviewRef.current,
          voiceId,
          voiceName: file.name,
        });
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error
            ? e.message
            : "Audio could not be saved. Try again.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function start() {
    setError("");
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error(
          "Recording is unavailable. You can attach an audio file instead.",
        );
      setBusy(true);
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current || !isActive.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const rec = new MediaRecorder(media),
        chunks: BlobPart[] = [];
      recorder.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => {
        media.getTracks().forEach((t) => t.stop());
        if (mounted.current) {
          setRecording(false);
          void attach(
            new File(chunks, "Voice feedback.webm", {
              type: rec.mimeType || "audio/webm",
            }),
          );
        }
      };
      rec.onerror = () => {
        media.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setError("Recording failed. Try again or attach an audio file.");
      };
      rec.start();
      setRecording(true);
    } catch {
      setError(
        "Microphone access is unavailable. Allow access and try again, or attach an audio file.",
      );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <div className="mr-voice">
      <h3>
        Voice feedback <span className="mr-muted">Optional</span>
      </h3>
      <p className="mr-muted">
        Record or attach audio up to 20 MB. Audio stays in this browser.
      </p>
      <input
        hidden
        type="file"
        accept="audio/*"
        ref={upload}
        aria-label="Attach voice feedback file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void attach(file);
          e.target.value = "";
        }}
      />
      <div className="tw-actions">
        <Button
          kind="secondary"
          disabled={busy}
          onClick={() => (recording ? recorder.current?.stop() : void start())}
        >
          {recording ? "Stop recording" : "Record feedback"}
        </Button>
        <Button
          kind="quiet"
          disabled={busy || recording}
          onClick={() => upload.current?.click()}
        >
          Attach audio
        </Button>
        {review.voiceId && (
          <Button
            kind="quiet"
            disabled={recording}
            onClick={() =>
              onChange({ ...review, voiceId: undefined, voiceName: undefined })
            }
          >
            Remove audio
          </Button>
        )}
      </div>
      {recording && (
        <p role="status">
          Recording… Stop when you finish. Audio stays in this browser.
        </p>
      )}
      {busy && <p role="status">Preparing audio…</p>}
      {url && (
        <>
          <p className="mr-muted">{review.voiceName}</p>
          <audio
            controls
            src={url}
            aria-label="Teacher voice feedback"
            onError={() =>
              setError(
                "Audio could not be played. Remove it and attach a valid recording.",
              )
            }
          />
        </>
      )}
      {error && (
        <p role="alert" className="mr-error">
          {error}
        </p>
      )}
    </div>
  );
}

type ResponseProps = {
  block: CompletedBlock;
  feedback: BlockFeedback;
  onChange: (value: BlockFeedback) => void;
};
export function ReviewedResponse(props: ResponseProps) {
  const { mobile } = useWorkspace();
  return mobile ? (
    <MobileReviewedResponse {...props} />
  ) : (
    <ReviewedResponseControl {...props} />
  );
}
function MobileReviewedResponse(props: ResponseProps) {
  const flow = useFlow();
  const screen = useRef(flow.current.id);
  return (
    <ReviewedResponseControl
      {...props}
      active={screen.current === flow.current.id}
    />
  );
}
function ReviewedResponseControl({
  block,
  feedback,
  onChange,
  active = true,
}: ResponseProps & { active?: boolean }) {
  const [position, setPosition] = useState(0),
    [duration, setDuration] = useState(block.recording?.seconds || 0),
    [speed, setSpeed] = useState("1");
  const [quote, setQuote] = useState(""),
    [correction, setCorrection] = useState(""),
    [note, setNote] = useState(""),
    [stamp, setStamp] = useState("0"),
    [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (!active) audio.current?.pause();
  }, [active]);
  const annotations = feedback.review?.annotations || [];
  const written = block.response || "";
  const marks = annotations.filter((a) => a.kind === "writing");
  const fragments = [];
  let cursor = 0;
  const ordered = marks
    .map((a) => ({ a, start: written.indexOf(a.quote) }))
    .filter((x) => x.start >= 0)
    .sort((a, b) => a.start - b.start);
  for (const { a, start } of ordered) {
    if (start < cursor) continue;
    fragments.push(written.slice(cursor, start));
    fragments.push(
      <mark key={a.id} title={a.correction || a.note}>
        {a.quote}
      </mark>,
    );
    cursor = start + a.quote.length;
  }
  fragments.push(written.slice(cursor));
  return (
    <>
      {block.recording ? (
        <>
          <p className="mr-recording">
            Voice response · {formatTime(duration)}
          </p>
          <p className="mr-muted">
            Synthetic sample audio for testing review tools. This is not a real
            student recording.
          </p>
          <audio
            ref={audio}
            controls
            preload="metadata"
            src={block.recording.src}
            aria-label={`Student recording · ${block.title}`}
            onLoadedMetadata={(e) => {
              if (Number.isFinite(e.currentTarget.duration))
                setDuration(e.currentTarget.duration);
              e.currentTarget.playbackRate = Number(speed);
            }}
            onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
            onError={() =>
              setError(
                "Recording could not be played. Reload to retry; the transcript remains available.",
              )
            }
          />
          <div className="mr-grid">
            <Select
              label={`Playback speed · ${block.title}`}
              value={speed}
              onChange={(v) => {
                setSpeed(v);
                if (audio.current) audio.current.playbackRate = Number(v);
              }}
              options={[
                { value: "0.75", label: "0.75×" },
                { value: "1", label: "1×" },
                { value: "1.25", label: "1.25×" },
                { value: "1.5", label: "1.5×" },
              ]}
            />
            <Button
              kind="secondary"
              onClick={() => {
                setStamp(String(Math.floor(position)));
                setError("");
              }}
            >
              Use current time ({formatTime(position)})
            </Button>
          </div>
          <details>
            <summary>Sample transcript</summary>
            <p>{block.recording.transcript}</p>
            <p className="mr-muted">
              Review the audio to assess pronunciation and fluency; the
              transcript alone cannot show these.
            </p>
          </details>
        </>
      ) : (
        <p className="mr-preserve">{fragments}</p>
      )}
      <details className="mr-correction">
        <summary>
          {block.recording
            ? "Add a timestamped comment"
            : "Add a correction to this response"}
        </summary>
        {block.recording ? (
          <TextField
            label="Timestamp (seconds)"
            type="number"
            min="0"
            max={String(duration)}
            value={stamp}
            onChange={setStamp}
          />
        ) : (
          <TextField
            label="Words to review"
            value={quote}
            onChange={setQuote}
            placeholder="Copy an exact excerpt from the response"
          />
        )}
        <TextField
          label="Suggested correction"
          value={correction}
          onChange={setCorrection}
        />
        <TextField
          label="Explanation or comment"
          multiline
          value={note}
          onChange={setNote}
        />
        <Button
          kind="secondary"
          onClick={() => {
            const annotation: Annotation = {
              id: crypto.randomUUID(),
              kind: block.recording ? "audio" : "writing",
              quote,
              correction,
              note,
              ...(block.recording
                ? { at: stamp.trim() ? Number(stamp) : NaN }
                : {}),
            };
            const message = validateAnnotation(annotation, block);
            if (message) {
              setError(message);
              return;
            }
            onChange({
              ...feedback,
              review: {
                ...feedback.review,
                annotations: [...annotations, annotation],
              },
            });
            setQuote("");
            setCorrection("");
            setNote("");
            setError("");
          }}
        >
          Save comment
        </Button>
      </details>
      {annotations.map((a) => (
        <div className="mr-annotation" key={a.id}>
          {a.kind === "audio" ? (
            <button
              className="mr-time-link"
              onClick={() => {
                if (audio.current) {
                  audio.current.currentTime = a.at || 0;
                  audio.current.focus();
                }
              }}
            >
              {formatTime(a.at || 0)}
            </button>
          ) : (
            <strong>“{a.quote}”</strong>
          )}
          {a.correction && <p>Suggested: {a.correction}</p>}
          {a.note && <p>{a.note}</p>}
          <Button
            kind="quiet"
            onClick={() =>
              onChange({
                ...feedback,
                review: {
                  ...feedback.review,
                  annotations: annotations.filter((x) => x.id !== a.id),
                },
              })
            }
          >
            Remove comment
          </Button>
        </div>
      ))}
      {error && (
        <p role="alert" className="mr-error">
          {error}
        </p>
      )}
    </>
  );
}

export function FeedbackEditor({
  block,
  feedback,
  comments,
  onChange,
  onSaveComment,
  onBusyChange,
}: {
  block: CompletedBlock;
  feedback: BlockFeedback;
  comments: SavedComment[];
  onChange: (v: BlockFeedback) => void;
  onSaveComment: (c: SavedComment) => boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const review = feedback.review || {};
  const [chosen, setChosen] = useState(""),
    [name, setName] = useState(""),
    [criterion, setCriterion] = useState(""),
    [error, setError] = useState("");
  const update = (r: ReviewDetails) => onChange({ ...feedback, review: r });
  const criteria = review.criteria || defaultCriteria(block);
  return (
    <div className="mr-feedback-editor">
      <h3>Feedback</h3>
      <div className="mr-grid">
        <Select
          label={`Saved comment · ${block.title}`}
          value={chosen}
          onChange={setChosen}
          options={[
            { value: "", label: "Choose a saved comment" },
            ...comments.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Button
          kind="secondary"
          disabled={!chosen}
          onClick={() => {
            const saved = comments.find((c) => c.id === chosen);
            if (!saved) return;
            const append = (a = "", b = "") =>
              [a, b].filter(Boolean).join("\n");
            update({
              ...review,
              strength: append(review.strength, saved.strength),
              improvement: append(review.improvement, saved.improvement),
              nextStep: append(review.nextStep, saved.nextStep),
            });
          }}
        >
          Insert comment
        </Button>
      </div>
      <TextField
        label={`What went well · ${block.title}`}
        multiline
        value={review.strength || ""}
        onChange={(strength) => update({ ...review, strength })}
      />
      <TextField
        label={`What to improve · ${block.title}`}
        multiline
        value={review.improvement || ""}
        onChange={(improvement) => update({ ...review, improvement })}
      />
      <TextField
        label={`What to try next · ${block.title}`}
        multiline
        value={review.nextStep || ""}
        onChange={(nextStep) => update({ ...review, nextStep })}
      />
      <details>
        <summary>Additional feedback and private notes</summary>
        <TextField
          label={`Additional feedback · ${block.title}`}
          multiline
          value={feedback.draft}
          onChange={(draft) => onChange({ ...feedback, draft })}
        />
        <TextField
          label={`Private teaching note · ${block.title}`}
          multiline
          value={review.privateNote || ""}
          onChange={(privateNote) => update({ ...review, privateNote })}
        />
        <p className="mr-muted">
          Private teaching notes are excluded from shared feedback and follow-up
          lessons.
        </p>
      </details>
      <details>
        <summary>Save this wording for reuse</summary>
        <TextField label="Saved comment name" value={name} onChange={setName} />
        <Button
          kind="secondary"
          onClick={() => {
            if (
              !name.trim() ||
              ![review.strength, review.improvement, review.nextStep].some(
                (v) => v?.trim(),
              )
            ) {
              setError("Add a name and at least one feedback message.");
              return;
            }
            if (
              onSaveComment({
                id: crypto.randomUUID(),
                name: name.trim(),
                strength: review.strength || "",
                improvement: review.improvement || "",
                nextStep: review.nextStep || "",
              })
            ) {
              setName("");
              setError("");
            }
          }}
        >
          Save reusable comment
        </Button>
        <Button
          kind="quiet"
          disabled={
            !chosen ||
            ![review.strength, review.improvement, review.nextStep].some((v) =>
              v?.trim(),
            )
          }
          onClick={() => {
            const old = comments.find((c) => c.id === chosen);
            if (!old) return;
            if (
              onSaveComment({
                id: old.id,
                name: name.trim() || old.name,
                strength: review.strength || "",
                improvement: review.improvement || "",
                nextStep: review.nextStep || "",
              })
            ) {
              setName("");
              setError("");
            }
          }}
        >
          Update selected comment
        </Button>
      </details>
      {(block.recording || (!block.answer && block.response)) && (
        <details className="mr-rubric">
          <summary>Assessment criteria</summary>
          <p className="mr-muted">
            Assess this task using evidence. Ratings do not determine a CEFR
            level or independence automatically.
          </p>
          {criteria.map((c) => (
            <div className="mr-criterion" key={c.id}>
              <TextField
                label={`Criterion · ${c.label}`}
                value={c.label}
                onChange={(label) =>
                  update({
                    ...review,
                    criteria: criteria.map((x) =>
                      x.id === c.id ? { ...x, label } : x,
                    ),
                  })
                }
              />
              <Select
                label={`Rating · ${c.label}`}
                value={c.rating}
                options={[...ratings]}
                onChange={(rating) =>
                  update({
                    ...review,
                    criteria: criteria.map((x) =>
                      x.id === c.id
                        ? { ...x, rating: rating as typeof c.rating }
                        : x,
                    ),
                  })
                }
              />
              <Button
                kind="quiet"
                onClick={() =>
                  update({
                    ...review,
                    criteria: criteria.filter((x) => x.id !== c.id),
                  })
                }
              >
                Remove criterion
              </Button>
            </div>
          ))}
          <TextField
            label="New criterion"
            value={criterion}
            onChange={setCriterion}
          />
          <Button
            kind="secondary"
            disabled={!criterion.trim()}
            onClick={() => {
              update({
                ...review,
                criteria: [
                  ...criteria,
                  {
                    id: crypto.randomUUID(),
                    label: criterion.trim(),
                    rating: "Not reviewed",
                  },
                ],
              });
              setCriterion("");
            }}
          >
            Add criterion
          </Button>
        </details>
      )}
      <VoiceFeedback
        review={review}
        onChange={update}
        onBusyChange={onBusyChange}
      />
      {error && (
        <p role="alert" className="mr-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function VoicePreview({ voiceId }: { voiceId?: string }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true,
      localUrl = "";
    setUrl("");
    setFailed(false);
    if (voiceId)
      loadMedia(voiceId)
        .then((blob) => {
          if (!blob) throw new Error("Missing audio");
          if (active) {
            localUrl = URL.createObjectURL(blob);
            setUrl(localUrl);
          }
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    return () => {
      active = false;
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [voiceId]);
  if (!voiceId) return null;
  return (
    <>
      {url && (
        <audio
          controls
          src={url}
          aria-label="Student feedback preview audio"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <p role="alert">
          Voice feedback could not be loaded. Attach the audio again before
          sharing.
        </p>
      )}
    </>
  );
}
