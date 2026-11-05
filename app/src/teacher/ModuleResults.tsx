import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Panel,
  Select,
  TextField,
  useWorkspace,
  type Navigate,
} from "./components";
import {
  canReviewBlock,
  feedbackStorageKey,
  moduleResults,
  readFeedback,
  shareModuleFeedback,
  type BlockFeedback,
  type CompletedBlock,
  type FeedbackBook,
  type ModuleResult,
} from "./module-results";
import {
  blockReviewLabel,
  nextUnreviewedBlock,
  commentStorageKey,
  defaultComments,
  feedbackText,
  followUpLesson,
  isPending,
  reviewStatus,
  type SavedComment,
  type FollowUpFormat,
} from "./review";
import { FeedbackEditor, ReviewedResponse, VoicePreview } from "./ReviewTools";
import { students } from "./model";
import { writeDraft } from "./course-storage";
import "./module-results.css";

function FollowUp({
  result,
  block,
  feedback,
  navigate,
}: {
  result: ModuleResult;
  block: CompletedBlock;
  feedback: BlockFeedback;
  navigate: Navigate;
}) {
  const student = students.find((s) => s.id === result.studentId)!;
  const [goal, setGoal] = useState(feedback.review?.nextStep || student.focus);
  const [prompt, setPrompt] = useState(
    feedback.review?.nextStep || block.prompt,
  );
  const [format, setFormat] = useState<FollowUpFormat>(
    block.recording ? "Spoken response" : "Written response",
  );
  const [error, setError] = useState("");
  const { setLessons, templates, setNotice } = useWorkspace();
  return (
    <details className="mr-followup">
      <summary>Prepare follow-up practice</summary>
      <p>
        Prepare an editable draft for {student.name.split(" ")[0]}. Review it in
        the Module editor before applying changes.
      </p>
      <TextField
        label="Follow-up learning goal"
        value={goal}
        onChange={setGoal}
      />
      <Select
        label="Follow-up block type"
        value={format}
        onChange={(v) => {
          setFormat(v as FollowUpFormat);
          if (v === "Reuse activity") setPrompt(block.prompt);
        }}
        options={["Written response", "Spoken response", "Reuse activity"]}
      />
      {format === "Reuse activity" && (
        <p className="mr-muted">
          The activity keeps its original answer key. Check the key in the
          editor if you change the prompt.
        </p>
      )}
      <TextField
        label="Follow-up student prompt"
        multiline
        value={prompt}
        onChange={setPrompt}
      />
      <Button kind="quiet" onClick={() => setPrompt(block.prompt)}>
        Reuse original prompt
      </Button>
      <Button
        kind="secondary"
        disabled={!goal.trim() || !prompt.trim()}
        onClick={() => {
          try {
            const lesson = followUpLesson(
              result,
              block,
              student,
              goal,
              prompt,
              format,
              crypto.randomUUID(),
            );
            writeDraft(
              {
                ...lesson,
                savedEditor: structuredClone(lesson.course),
                savedAt: new Date().toISOString(),
              },
              templates,
            );
            setLessons((ls) => [...ls, lesson]);
            setNotice(
              "Follow-up draft saved for this student. Review it before applying changes.",
            );
            navigate({ page: "editor", id: lesson.id });
          } catch {
            setError(
              "The follow-up draft could not be saved. Your feedback is kept. Try again.",
            );
          }
        }}
      >
        Create practice draft
      </Button>
      {error && (
        <p role="alert" className="mr-error">
          {error}
        </p>
      )}
    </details>
  );
}

export default function ModuleResults({
  studentId,
  selected: initialSelection,
  navigate,
}: {
  studentId: string;
  selected?: string;
  navigate: Navigate;
}) {
  const results = moduleResults.filter(
    (result) => result.studentId === studentId,
  );
  const [selected, setSelected] = useState(
    initialSelection || results[0]?.id || "",
  );
  const [initial] = useState(() => {
    try {
      return { book: readFeedback(localStorage), error: "" };
    } catch {
      return {
        book: {} as FeedbackBook,
        error:
          "Saved feedback could not be loaded. Reload this page to retry. Your existing saved data has not been changed.",
      };
    }
  });
  const [book, setBook] = useState(initial.book),
    [error, setError] = useState(initial.error),
    [message, setMessage] = useState("");
  const [comments, setComments] = useState<SavedComment[]>(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem(commentStorageKey) || "null",
      );
      return Array.isArray(data) &&
        data.every(
          (c) =>
            c &&
            [c.id, c.name, c.strength, c.improvement, c.nextStep].every(
              (v) => typeof v === "string",
            ),
        )
        ? data
        : defaultComments;
    } catch {
      return defaultComments;
    }
  });
  const [blockSelection, setBlockSelection] = useState<{ result: string; block: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [mediaBusy, setMediaBusy] = useState<Record<string, boolean>>({});
  const { offline } = useWorkspace();
  const result = results.find((r) => r.id === selected) || results[0];
  const save = (next: FeedbackBook, success: string) => {
    try {
      if (initial.error) {
        setError(initial.error);
        return false;
      }
      localStorage.setItem(feedbackStorageKey, JSON.stringify(next));
      setBook(next);
      setError("");
      setMessage(success);
      window.dispatchEvent(new Event("mimo-feedback-changed"));
      return true;
    } catch {
      setError(
        "Feedback could not be saved in this browser. Keep this page open and try Save feedback again.",
      );
      setMessage("");
      return false;
    }
  };
  const update = (blockId: string, value: BlockFeedback) => {
    const next = {
      ...book,
      [result.id]: { ...book[result.id], [blockId]: value },
    };
    setBook(next);
    save(next, "Feedback draft saved in this browser.");
  };
  const activeBlock = result?.blocks.find((b) =>
    blockSelection?.result === result.id && b.id === blockSelection.block
  ) || result?.blocks[0];
  useEffect(() => {
    contentRef.current?.querySelectorAll("audio").forEach((audio) => audio.pause());
    if (blockSelection) headingRef.current?.focus({ preventScroll: true });
  }, [result?.id, activeBlock?.id]);
  if (!result)
    return (
      <Panel>
        <h2>No completed blocks yet</h2>
        <p>
          Completed blocks and student responses will appear here, ready for
          your feedback.
        </p>
        <p className="mr-muted">
          This prototype uses sample submissions. New lessons do not generate
          student results automatically.
        </p>
      </Panel>
    );
  const rows = book[result.id] || {},
    reviewable = result.blocks.filter(canReviewBlock);
  const pending = reviewable.filter((b) => isPending(rows[b.id])).length,
    shared = reviewable.filter((b) => rows[b.id]?.shared).length;
  const student = students.find((s) => s.id === studentId)!;
  const activeIndex = result.blocks.findIndex((b) => b.id === activeBlock?.id);
  const unreviewed = reviewable.filter((b) => blockReviewLabel(b, rows[b.id]) === "Unreviewed").length;
  const nextUnreviewed = nextUnreviewedBlock(result, rows, activeBlock?.id || "");
  const busy = Object.values(mediaBusy).some(Boolean);
  const chooseBlock = (id: string) => {
    if (!busy) setBlockSelection({ result: result.id, block: id });
  };
  return (
    <div className="mr-results" ref={contentRef}>
      <Panel className="mr-module-context">
        <div className="mr-heading">
          <Badge tone="lilac">Sample student work</Badge>
          <span>Submitted {result.completedAt}</span>
        </div>
        {busy && <p role="status">Finish or cancel the audio recording before switching blocks or modules.</p>}
        <fieldset className="mr-module-select" disabled={busy}>
        <Select
          label="Completed module"
          value={result.id}
          onChange={(id) => {
            setSelected(id);
            setMessage("");
          }}
          options={results.map((r) => ({
            value: r.id,
            label: `${r.type} · ${r.module}`,
          }))}
        />
        </fieldset>
        <h2>{result.module}</h2>
        <p>
          {result.lesson} · {result.blocks.length} completed blocks
        </p>
        <Badge
          tone={
            reviewStatus(result, book) === "Feedback shared"
              ? "green"
              : "orange"
          }
        >
          {reviewStatus(result, book)}
        </Badge>
        <details>
        <summary>Learning goals and review context</summary>
        <p>
          <strong>Student goal:</strong> {student.goal}
        </p>
        {result.goal && (
          <p>
            <strong>Module learning goal:</strong> {result.goal}
          </p>
        )}
        <p className="mr-muted">
          Viewed content, teacher review and demonstrated skills are separate.
          No proficiency level is inferred from completion.
        </p>
        <p className="mr-muted">
          Drafts stay private in this browser. Sharing and submission history
          are simulated.
        </p>
        </details>
      </Panel>
      {result.blocks.length > 0 && (
        <nav className="mr-block-nav" aria-label="Completed block navigation">
          <div className="mr-block-nav-heading">
            <strong>Block {activeIndex + 1} of {result.blocks.length}</strong>
            <span>{unreviewed} unreviewed · {pending} ready to share · {shared} shared</span>
          </div>
          <div className="mr-block-nav-controls">
            <Button kind="secondary" disabled={busy || activeIndex <= 0} onClick={() => chooseBlock(result.blocks[activeIndex - 1].id)}>Previous block</Button>
            <fieldset disabled={busy}>
              <Select label="Jump to block" value={activeBlock?.id || ""} onChange={chooseBlock}
                options={result.blocks.map((b, i) => ({ value: b.id, label: `${i + 1}. ${b.title} — ${blockReviewLabel(b, rows[b.id])}` }))} />
            </fieldset>
            <Button kind="secondary" disabled={busy || activeIndex >= result.blocks.length - 1} onClick={() => chooseBlock(result.blocks[activeIndex + 1].id)}>Next block</Button>
            <Button disabled={busy || !nextUnreviewed} onClick={() => nextUnreviewed && chooseBlock(nextUnreviewed)}>Next unreviewed</Button>
          </div>
          <p className="mr-muted" role="status">
            {busy ? "Finish or cancel recording before navigating." : unreviewed === 0 ? "No unreviewed responses. Draft feedback may still need sharing." : !nextUnreviewed && blockReviewLabel(activeBlock!, rows[activeBlock!.id]) === "Unreviewed" ? "This is the last unreviewed response." : "Unreviewed means no student-facing feedback yet. Draft feedback stays private until shared."}
          </p>
        </nav>
      )}
      {result.blocks.map((block, index) => {
        const feedback = rows[block.id] || { draft: "" },
          changed = isPending(feedback);
        const openResponse = canReviewBlock(block) && !block.answer;
        return (
          <div key={`${result.id}-${block.id}`} hidden={activeBlock?.id !== block.id} className="mr-block-shell" role="region" aria-labelledby={`mr-heading-${result.id}-${block.id}`}>
          <Panel className="mr-block">
            <div className="mr-heading">
              <span>
                Block {index + 1} · {block.type}
              </span>
              <Badge tone="green">
                {canReviewBlock(block) ? "Submitted" : "Viewed"}
              </Badge>
            </div>
            <h2 id={`mr-heading-${result.id}-${block.id}`} tabIndex={-1} ref={activeBlock?.id === block.id ? headingRef : undefined}>{block.title}</h2>
            <div className="mr-content">
              <h3>Block content</h3>
              <p>{block.prompt}</p>
            </div>
            <div className="mr-response">
              <h3>
                {canReviewBlock(block)
                  ? "Student response"
                  : "Learning material"}
              </h3>
              {openResponse ? (
                <ReviewedResponse
                  key={`${result.id}-${block.id}`}
                  block={block}
                  feedback={feedback}
                  onChange={(value) => update(block.id, value)}
                />
              ) : (
                <p>
                  {block.response ||
                    "Viewed this teaching block. No answer was required."}
                </p>
              )}
              {block.answer && (
                <>
                  <p
                    className={`mr-evaluation ${block.correct ? "correct" : "incorrect"}`}
                  >
                    {block.correct ? "✓ Correct" : "✕ Incorrect"} · Answer-key
                    result
                  </p>
                  <h3>Teacher-provided answer</h3>
                  <p>{block.answer}</p>
                  <p className="mr-muted">
                    This checks this response only. It does not establish
                    proficiency.
                  </p>
                </>
              )}
              {openResponse && <Badge tone="orange">Teacher review</Badge>}
            </div>
            {canReviewBlock(block) && (
              <>
                <FeedbackEditor
                  key={`${result.id}-${block.id}`}
                  block={block}
                  feedback={feedback}
                  comments={comments}
                  onChange={(value) => update(block.id, value)}
                  onBusyChange={(busy) =>
                    setMediaBusy((old) =>
                      old[`${result.id}-${block.id}`] === busy
                        ? old
                        : { ...old, [`${result.id}-${block.id}`]: busy },
                    )
                  }
                  onSaveComment={(comment) => {
                    try {
                      const next = [
                        ...comments.filter((c) => c.id !== comment.id),
                        comment,
                      ];
                      localStorage.setItem(
                        commentStorageKey,
                        JSON.stringify(next),
                      );
                      setComments(next);
                      setMessage(
                        "Reusable comment saved. Insert it in any block and edit the wording.",
                      );
                      return true;
                    } catch {
                      setError(
                        "The reusable comment could not be saved. Your feedback text is kept.",
                      );
                      return false;
                    }
                  }}
                />
                <p className="mr-muted">
                  {feedback.shared
                    ? changed
                      ? "Edited draft · previous feedback shared in preview"
                      : "Shared in preview"
                    : "Private draft · not shared"}
                </p>
                {feedback.shared && (
                  <details>
                    <summary>Previously shared feedback</summary>
                    <p className="mr-preserve">{feedback.shared}</p>
                    <VoicePreview voiceId={feedback.sharedReview?.voiceId} />
                  </details>
                )}
                <FollowUp
                  key={`${result.id}-${block.id}-${feedback.review?.nextStep || ""}`}
                  result={result}
                  block={block}
                  feedback={feedback}
                  navigate={navigate}
                />
              </>
            )}
          </Panel>
          </div>
        );
      })}
      <Panel className="mr-feedback-actions">
        <h2>Feedback for this module</h2>
        <p>
          {pending} {pending === 1 ? "block has" : "blocks have"} feedback ready
          to share · {shared} shared in preview
        </p>
        {error && (
          <p role="alert" className="mr-error">
            {error}
          </p>
        )}
        <p role="status" aria-live="polite">
          {message}
        </p>
        <details>
          <summary>Preview student feedback before sharing</summary>
          {reviewable
            .filter((b) => feedbackText(rows[b.id] || { draft: "" }))
            .map((b) => (
              <article key={b.id}>
                <h3>{b.title}</h3>
                <p className="mr-preserve">{feedbackText(rows[b.id])}</p>
                <VoicePreview voiceId={rows[b.id].review?.voiceId} />
              </article>
            ))}
          <p className="mr-muted">Private teaching notes are excluded.</p>
        </details>
        <div className="tw-actions">
          <Button
            kind="secondary"
            disabled={!!initial.error}
            onClick={() =>
              save(
                book,
                "Feedback saved in this browser. No additional feedback has been shared.",
              )
            }
          >
            Save feedback
          </Button>
          <Button
            disabled={
              !pending ||
              !!initial.error ||
              Object.values(mediaBusy).some(Boolean)
            }
            onClick={() => {
              if (offline) {
                setError(
                  "Connection unavailable. Your feedback draft is kept. Reconnect in Account settings, then try sharing again.",
                );
                return;
              }
              save(
                shareModuleFeedback(result, book, new Date().toISOString()),
                "Feedback shared in preview. No real student was notified.",
              );
            }}
          >
            Share feedback (preview)
          </Button>
        </div>
      </Panel>
    </div>
  );
}
