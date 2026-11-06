import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Panel,
  Select,
  TextField,
  StudentLine,
  type Navigate,
} from "./components";
import { students } from "./model";
import {
  moduleResults,
  readFeedback,
  type FeedbackBook,
} from "./module-results";
import { remainingReviews, reviewStatus } from "./review";
import "./module-results.css";

export default function ReviewQueue({ navigate }: { navigate: Navigate }) {
  const [book, setBook] = useState<FeedbackBook>({});
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All submissions");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const refresh = () => {
      try {
        setBook(readFeedback(localStorage));
        setError("");
      } catch {
        setError(
          "Saved review status could not be loaded. Reload to retry before reviewing work.",
        );
      }
    };
    refresh();
    window.addEventListener("mimo-feedback-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mimo-feedback-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const filtered = moduleResults.filter(
    (r) =>
      (filter === "All submissions" || reviewStatus(r, book) === filter) &&
      `${students.find((s) => s.id === r.studentId)?.name} ${r.module} ${r.lesson}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <Panel className="mr-queue">
      <div className="mr-heading">
        <h2>Review queue</h2>
        <Badge tone="lilac">Sample submissions</Badge>
      </div>
      <p>
        See which student responses need your attention. Completion and teacher
        review are tracked separately.
      </p>
      {error && (
        <p role="alert" className="mr-error">
          {error}
        </p>
      )}
      <div className="mr-grid">
        <Select
          label="Review status"
          value={filter}
          onChange={setFilter}
          options={[
            "All submissions",
            "Awaiting review",
            "Feedback shared",
            "Revision submitted",
          ]}
        />
        <TextField
          label="Find student or module"
          value={query}
          onChange={setQuery}
          placeholder="Search student, lesson or module"
        />
      </div>
      <p className="mr-muted">
        {filtered.length} {filtered.length === 1 ? "submission" : "submissions"}{" "}
        · Review status does not indicate language proficiency.
      </p>
      {filtered.map((r) => (
        <article className="mr-queue-row" key={r.id}>
          <div>
            <StudentLine id={r.studentId} />
            <h3>{r.module}</h3>
            <p>
              {r.lesson} · {r.type}
            </p>
            <p className="mr-muted">
              Submitted {r.completedAt}
              {r.revision ? " · Attempt 2 · sample revision" : " · Attempt 1"}
            </p>
          </div>
          <div className="mr-queue-action">
            <Badge
              tone={
                reviewStatus(r, book) === "Feedback shared" ? "green" : "orange"
              }
            >
              {reviewStatus(r, book)}
            </Badge>
            <span>{remainingReviews(r, book)} responses to review</span>
            <Button
              kind="secondary"
              disabled={!!error}
              onClick={() =>
                navigate({ page: "results", id: r.studentId, tab: r.id })
              }
            >
              Review responses
            </Button>
          </div>
        </article>
      ))}
      {!filtered.length && (
        <p role="status">No submissions match these filters.</p>
      )}
    </Panel>
  );
}
