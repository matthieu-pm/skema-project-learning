import { Icon } from "../teacher/icons";
import { moduleHeading } from "../teacher/course";
import { Button, Panel } from "./components";
import { lessonLanguageFor, type Booking } from "./model";
import { type PreparationProgress, preparationBlocks, preparationCounts, preparationFor, readPreparation } from "./preparation";

/** Recap of a completed lesson, built only from its booked material and the learner's saved progress. */
export default function LessonRecap({ booking, onContinue, onMessage }: { booking: Booking; onContinue: () => void; onMessage: () => void }) {
  const preparation = preparationFor(booking);
  if (!preparation) return <Panel className="lw-stack lw-recap-empty">
    <h2>No recap for this lesson yet</h2>
    <p>Your teacher didn’t add lesson material to this {lessonLanguageFor(booking)} lesson. Notes they share will appear here.</p>
    <Button secondary icon="chat" onClick={onMessage}>Ask your teacher for a recap</Button>
  </Panel>;
  let progress: PreparationProgress = { blocks: {} }, error = "";
  try { progress = readPreparation(booking); } catch (reason) { error = reason instanceof Error ? reason.message : "Saved progress couldn’t be read."; }
  const counts = preparationCounts(preparation, progress), words = preparationBlocks(preparation).flatMap(({ block }) => block.words).filter((word, index, all) => word.word && all.findIndex(other => other.word === word.word) === index).slice(0, 8);
  return <>
    <Panel className="lw-stack">
      <h2>{preparation.course.title}</h2>
      <p className="lw-muted">{lessonLanguageFor(booking)} · Level {preparation.course.level} · {preparation.course.modules.length} topics</p>
      {error ? <p className="lw-error" role="alert">{error}</p> : <div className="lw-preparation-progress"><div><span>{counts.completed} of {counts.total} blocks done</span><strong>{counts.percent}%</strong></div><progress aria-label="Saved lesson progress" max={counts.total} value={counts.completed} /></div>}
      {counts.completed < counts.total ? <Button icon="repeat" onClick={onContinue}>Keep practicing</Button> : <Button secondary icon="book" onClick={onContinue}>Review lesson material</Button>}
    </Panel>
    <Panel className="lw-stack">
      <h2>What you covered</h2>
      <ol className="lw-recap-modules">{preparation.course.modules.map((module, index) => <li key={module.id}><span className="lw-recap-index" aria-hidden="true">{index + 1}</span><strong>{moduleHeading(module)}</strong></li>)}</ol>
    </Panel>
    {words.length > 0 && <Panel className="lw-stack"><h2>Key vocabulary</h2><ul className="lw-recap-words">{words.map(word => <li key={word.id}><strong>{word.word}</strong>{word.meaning && <span>{word.meaning}</span>}</li>)}</ul></Panel>}
  </>;
}
