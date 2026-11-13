import ProfilePortrait from "../ProfilePortrait";
import { teachers } from "../learner/model";
import { learnerPortraitId } from "../learner/components";
import { Badge, Panel } from "./components";

type Review = { id: string; author: string; rating: number; text: string; date: string };
/** Reviews students left after completed lessons (public profile reviews plus any saved on this device). */
function teacherReviews(teacherId: string): Review[] {
  const base = teachers.find(teacher => teacher.id === teacherId)?.reviews ?? [];
  let own: Review[] = [];
  try {
    const bookings = JSON.parse(localStorage.getItem("mimo.learner-bookings.v1") || "null")?.bookings ?? [];
    const learner = JSON.parse(localStorage.getItem("mimo.learner-profile.v1") || "null")?.profile?.name || "Alex";
    own = bookings.filter((b: { teacherId: string; review?: unknown }) => b.teacherId === teacherId && b.review)
      .map((b: { id: string; review: { rating: number; text: string; date: string } }) => ({ id: `own-${b.id}`, author: learner, rating: b.review.rating, text: b.review.text, date: b.review.date.slice(0, 10) }));
  } catch { /* Reviews still show the public ones if saved data can't be read. */ }
  return [...own, ...base];
}
const stars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);
const when = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function TeacherReviews({ teacherId }: { teacherId?: string }) {
  const reviews = teacherId ? teacherReviews(teacherId) : [];
  const count = reviews.length, average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  return (
    <Panel className="tw-reviews">
      <div className="tw-reviews-heading">
        <h2>Reviews from students</h2>
        {count > 0 && <Badge>Visible on your public profile</Badge>}
      </div>
      {count ? (
        <>
          <div className="tw-reviews-summary">
            <div className="tw-reviews-score"><strong>{average.toFixed(1)}</strong><span className="tw-stars" aria-hidden="true">{stars(Math.round(average))}</span><small>{count} {count === 1 ? "review" : "reviews"}</small></div>
            <dl className="tw-reviews-breakdown" aria-label="Ratings breakdown">
              {[5, 4, 3, 2, 1].map(score => {
                const n = reviews.filter(r => r.rating === score).length;
                return <div key={score}><dt>{score} ★</dt><dd><span className="tw-reviews-bar"><span style={{ width: `${(n / count) * 100}%` }} /></span><small>{n}</small></dd></div>;
              })}
            </dl>
          </div>
          <ul className="tw-reviews-list">
            {reviews.map(review => (
              <li key={review.id}>
                <span className="tw-avatar" aria-hidden="true">{learnerPortraitId(review.author) ? <ProfilePortrait id={learnerPortraitId(review.author)!} initials={review.author.slice(0, 1)} /> : review.author.slice(0, 1)}</span>
                <div>
                  <div className="tw-review-meta"><strong>{review.author}</strong><span className="tw-stars" aria-label={`${review.rating} out of 5 stars`}>{stars(review.rating)}</span><small>{when(review.date)}</small></div>
                  <p>{review.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : <p className="tw-subtle">No reviews yet. Students can rate a lesson after it’s completed, and their reviews will appear here.</p>}
    </Panel>
  );
}
