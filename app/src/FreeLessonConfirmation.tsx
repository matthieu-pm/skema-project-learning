import { CheckIcon } from "./teacher/icons";
import "./lesson-settings.css";
export default function FreeLessonConfirmation({
  confirmed,
  onChange,
}: {
  confirmed: boolean;
  onChange: (confirmed: boolean) => void;
}) {
  return (
    <section
      className="lesson-free-confirm"
      aria-label="Free lesson confirmation"
    >
      <h3>Offer this lesson for free?</h3>
      <p>
        Students will pay €0 per lesson at this price. You can change the price
        for future lessons.
      </p>
      <button
        type="button"
        role="checkbox"
        aria-checked={confirmed}
        className="lesson-free-check"
        onClick={() => onChange(!confirmed)}
      >
        <span className="lesson-free-box" aria-hidden="true">
          {confirmed && <CheckIcon />}
        </span>
        <span>I confirm that I want to offer these lessons for free.</span>
      </button>
      {!confirmed && (
        <p className="lesson-settings-note">
          Confirm to use €0, enter a paid price, or leave the price blank to
          decide later.
        </p>
      )}
    </section>
  );
}
