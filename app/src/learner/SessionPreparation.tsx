import { useEffect, useRef, useState, type ReactNode } from "react";
import { MobileScroll, useKeyboard, useKeyboardInsets } from "../mobile";
import { Icon } from "../teacher/icons";
import { accepts, answerKey, autoAssessed, type CourseBlock } from "../teacher/course";
import { Button, Empty, ErrorMessage, Field, Panel, Select } from "./components";
import type { Booking } from "./model";
import { answerItems, emptyAttempt, preparationBlocks, preparationCounts, preparationFor, readPreparation, savePreparation, subscribePreparation, type BlockAttempt, type PreparationProgress } from "./preparation";

function useProgress(booking: Booking) {
  const load = () => {
    try { return { progress: readPreparation(booking), error: "" }; }
    catch (reason) { return { progress: { blocks: {} } as PreparationProgress, error: reason instanceof Error ? reason.message : "Preparation could not be loaded." }; }
  };
  const [state, setState] = useState(load);
  const reload = () => setState(load());
  useEffect(() => subscribePreparation(reload), [booking.id, booking.preparationId]);
  return { ...state, reload, setProgress: (progress: PreparationProgress) => setState({ progress, error: "" }) };
}
function Progress({ completed, total }: { completed: number; total: number }) {
  return <div className="lw-preparation-progress"><div><span>{completed} of {total} blocks complete</span><strong>{Math.round(completed / total * 100)}%</strong></div><progress aria-label="Preparation progress" max={total} value={completed} /></div>;
}
export function PreparationSummary({ booking, onOpen, detailed = false, onMessage }: { booking: Booking; onOpen: () => void; detailed?: boolean; onMessage?: () => void }) {
  const preparation = preparationFor(booking), { progress, error, reload } = useProgress(booking);
  if (booking.status !== "confirmed") return null;
  if (!preparation) return detailed ? <Panel><h2>Before your session</h2><p>Your teacher hasn’t added preparation modules for this session yet.</p>{onMessage && <Button secondary icon="message" onClick={onMessage}>Ask about preparation</Button>}</Panel> : null;
  const counts = preparationCounts(preparation, progress), done = counts.completed === counts.total;
  const content = <><h3>{detailed ? "Prepare for your lesson" : preparation.course.title}</h3>{detailed && <p>Complete these modules before your session. You can return to any unfinished block.</p>}{error ? <><ErrorMessage>{error}</ErrorMessage><Button secondary onClick={reload}>Reload progress</Button></> : <Progress {...counts} />}<Button secondary={!detailed} icon={done ? "check" : "book"} onClick={onOpen}>{done ? "Review preparation" : counts.completed ? "Continue preparation" : "Prepare for your lesson"}</Button></>;
  return detailed ? <Panel className="lw-session-preparation">{content}</Panel> : <div className="lw-preparation-summary">{content}</div>;
}
function Scroll({ mobile, children, className = "" }: { mobile: boolean; children: ReactNode; className?: string }) {
  return mobile ? <MobileScroll className={className}>{children}</MobileScroll> : <div className={`lw-preparation-scroll ${className}`}>{children}</div>;
}
function stopSpeech() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }
function listen(text: string) {
  if (!("speechSynthesis" in window)) return;
  stopSpeech(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "fr-FR"; speechSynthesis.speak(utterance);
}

export default function SessionPreparation({ booking, mobile, active = true, onSession, onMessage }: { booking: Booking; mobile: boolean; active?: boolean; onSession: () => void; onMessage: () => void }) {
  const preparation = preparationFor(booking), { progress, error: loadError, reload, setProgress } = useProgress(booking);
  const [selected, setSelected] = useState<string | null>(null), [drafts, setDrafts] = useState<Record<string, BlockAttempt>>({}), [pending, setPending] = useState(0), [error, setError] = useState("");
  const draftRef = useRef(drafts), heading = useRef<HTMLHeadingElement>(null);
  const keyboard = useKeyboard(), { isKeyboardVisible, keyboardHeight } = useKeyboardInsets();
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!active) stopSpeech(); return stopSpeech; }, [active, selected]);
  useEffect(() => { if (selected) heading.current?.focus({ preventScroll: true }); }, [selected]);
  useEffect(() => {
    if (!mobile || !isKeyboardVisible) return;
    const frame = requestAnimationFrame(() => {
      const scroll = body.current?.querySelector<HTMLElement>(".mobile-scroll"), input = document.activeElement;
      if (!scroll || !(input instanceof HTMLElement) || !scroll.contains(input)) return;
      const viewport = scroll.getBoundingClientRect(), field = input.getBoundingClientRect(), scale = viewport.height ? scroll.clientHeight / viewport.height : 1;
      if (field.bottom > viewport.bottom - 10) scroll.scrollTop += (field.bottom - viewport.bottom + 10) * scale;
      else if (field.top < viewport.top + 10) scroll.scrollTop -= (viewport.top - field.top + 10) * scale;
    });
    return () => cancelAnimationFrame(frame);
  }, [mobile, isKeyboardVisible, keyboardHeight, selected]);
  if (booking.status !== "confirmed") return <Empty title="This session was cancelled" action={<Button secondary onClick={onSession}>Back to session</Button>}>Its preparation is no longer available.</Empty>;
  if (!preparation) return <Empty title="No preparation assigned yet" action={<Button secondary onClick={onMessage}>Ask your teacher</Button>}>Your teacher can add modules for this session.</Empty>;
  if (loadError) return <div className="lw-preparation-error"><ErrorMessage>{loadError}</ErrorMessage><Button onClick={reload}>Reload progress</Button><Button secondary onClick={onSession}>Back to session</Button></div>;
  const sequence = preparationBlocks(preparation), counts = preparationCounts(preparation, progress), done = counts.completed === counts.total;
  const index = sequence.findIndex(({ block }) => block.id === selected), current = sequence[index];
  const select = (id: string | null) => { keyboard.hide(); stopSpeech(); setSelected(id); };
  const update = (block: CourseBlock, patch: Partial<BlockAttempt>) => {
    const attempt = { ...(draftRef.current[block.id] ?? progress.blocks[block.id] ?? emptyAttempt()), ...patch };
    draftRef.current = { ...draftRef.current, [block.id]: attempt }; setDrafts(draftRef.current); setPending(value => value + 1);
    savePreparation(booking, block.id, attempt).then(saved => { setProgress(saved); setError(""); }).catch(reason => setError(reason instanceof Error ? reason.message : "Your progress could not be saved. Try again.")).finally(() => setPending(value => value - 1));
  };
  const firstUnfinished = sequence.find(({ block }) => !progress.blocks[block.id]?.completedAt) ?? sequence[0];
  return <div className={`lw-preparation ${current ? "lw-preparation-player" : "lw-preparation-overview"}`} data-keyboard={mobile && isKeyboardVisible}>
    {current ? <>
      <header className="lw-preparation-player-heading"><p>{preparation.course.title}</p><Progress {...counts} /><div><strong>{current.module.title}</strong><span>Block {index + 1} of {counts.total} · {current.module.minutes} min in this module</span></div></header>
      <div className="lw-preparation-body" ref={body}><Scroll key={selected} mobile={mobile} className="lw-preparation-activity-scroll"><div className="lw-preparation-activity"><span className="lw-muted">{current.block.purpose === "Teach" ? "Learn" : "Practice"} · {current.block.format}</span><h1 ref={heading} tabIndex={-1}>{current.block.title}</h1><p>{current.block.instructions}</p><Activity key={selected} block={current.block} attempt={drafts[current.block.id] ?? progress.blocks[current.block.id] ?? emptyAttempt()} completed={!!progress.blocks[current.block.id]?.completedAt} onChange={patch => update(current.block, patch)} />
        {error && <div className="lw-preparation-save-error"><ErrorMessage>{error}</ErrorMessage><Button secondary disabled={!!pending} onClick={() => update(current.block, {})}>Try saving again</Button></div>}
        <p className="lw-preparation-save-status" role="status">{pending ? "Saving progress…" : error ? "Your latest changes have not been saved." : "Progress stays in this browser. You can return to unfinished blocks."}</p>
      </div></Scroll></div>
      <footer className="lw-preparation-controls"><div><Button secondary disabled={index === 0 || !!pending || !!error} onClick={() => select(sequence[index - 1].block.id)}>Previous</Button><Button disabled={!!pending || !!error} onClick={() => select(index === sequence.length - 1 ? null : sequence[index + 1].block.id)}>{index === sequence.length - 1 ? "View preparation" : "Next block"}</Button></div><button className="lw-text-button" disabled={!!pending || !!error} onClick={() => select(null)}>Return to curriculum</button></footer>
    </> : <Scroll mobile={mobile} className="lw-preparation-overview-scroll"><div className="lw-preparation-overview-content"><div className="lw-page-heading"><div><p className="lw-muted">{preparation.course.language} · {preparation.course.level} · Before your session</p><h1>{preparation.course.title}</h1><p>Complete these modules to prepare for your conversation.</p></div><Button secondary onClick={onSession}>Back to session</Button></div><Panel className="lw-session-preparation"><h2>{done ? "Your preparation is complete" : "Your preparation"}</h2><Progress {...counts} />{done ? <p>You’ve completed all the blocks. Bring your questions to the session; you can revisit your answers at any time.</p> : <p>Your answers and completed blocks stay saved in this browser.</p>}<Button icon={done ? "check" : "book"} onClick={() => select(firstUnfinished.block.id)}>{done ? "Review your answers" : counts.completed ? "Continue preparation" : "Start preparation"}</Button></Panel>
      <div className="lw-curriculum-modules">{preparation.course.modules.map((module, m) => <details className="lw-curriculum-module lw-assigned-module" key={module.id} open={module.id === firstUnfinished.module.id}><summary><span className="lw-module-number">{String(m + 1).padStart(2, "0")}</span><span><strong>{module.title}</strong><small>{module.blocks.filter(block => progress.blocks[block.id]?.completedAt).length} of {module.blocks.length} {module.blocks.length === 1 ? "block" : "blocks"} complete · {module.minutes} min</small></span><Icon name="down" size={18} /></summary><ul>{module.blocks.map(block => <li key={block.id}><button onClick={() => select(block.id)}><Icon name={progress.blocks[block.id]?.completedAt ? "check" : "circle"} size={18} /><span>{block.title}<small>{block.purpose}</small></span><span>{progress.blocks[block.id]?.completedAt ? "Complete" : "Open"}</span><Icon name="arrow" size={16} /></button></li>)}</ul></details>)}</div><p className="lw-muted">Preparation is saved on this browser only. Teacher review and delivery are not connected.</p></div></Scroll>}
  </div>;
}

function Activity({ block: b, attempt: a, completed, onChange }: { block: CourseBlock; attempt: BlockAttempt; completed: boolean; onChange: (patch: Partial<BlockAttempt>) => void }) {
  const isWords = ["Vocabulary recall", "Flashcards"].includes(b.format), isPairs = ["Matching pairs", "Word sorting"].includes(b.format), isSentence = b.format === "Sentence construction";
  const [card, setCard] = useState(() => Math.max(0, b.words.findIndex(word => !a.revealed.includes(word.id))));
  const word = b.words[card], item = isWords ? word.id : "activity", submitted = a.submitted.includes(item), revealed = a.revealed.includes(item), auto = autoAssessed(b);
  const answer = isSentence ? a.order.map(id => b.parts.find(part => part.id === id)?.text).join(" ") : a.answers[item] || "";
  const filled = isPairs ? b.pairs.every(pair => a.answers[pair.id]?.trim()) : isSentence ? a.order.length === b.parts.length : !!answer.trim();
  const correct = isPairs ? b.pairs.every(pair => accepts(a.answers[pair.id] || "", pair.right)) : accepts(answer, answerKey(b, card), b.alternatives);
  const setAnswer = (id: string, value: string) => onChange({ answers: { ...a.answers, [id]: value } });
  return <div className="lw-preparation-task">
    {completed && <span className="lw-status"><Icon name="check" size={16} />Block complete</span>}
    {isWords && <div className="lw-preparation-flashcard"><small>Card {card + 1} of {b.words.length}</small><span className="lw-preparation-picture" aria-hidden="true">{word.picture}</span><h2>{b.purpose === "Teach" ? word.word : word.meaning}</h2>{b.purpose === "Teach" && <><Button secondary onClick={() => listen(word.pronunciation || word.word)}>Hear pronunciation</Button><Button secondary disabled={revealed} onClick={() => onChange({ revealed: [...a.revealed, item] })}>Reveal meaning</Button>{revealed && <p>{word.meaning}</p>}</>}</div>}
    {b.purpose === "Teach" && isSentence && <div className="lw-preparation-example"><p lang="fr">{b.parts.map(part => part.text).join(" ")}</p><p className="lw-muted">{b.translation}</p><dl className="lw-facts">{b.parts.map(part => <div key={part.id}><dt>{part.text}</dt><dd>{part.note}</dd></div>)}</dl></div>}
    {["Audio", "Video"].includes(b.format) && b.clips.map(clip => <Panel key={clip.id}><h3>{clip.title}</h3><p>Sample dialogue · generated speech</p><Button secondary icon="audio" onClick={() => listen(clip.transcript)}>Listen to the example</Button><details><summary>Read transcript</summary><p lang="fr">{clip.transcript}</p></details></Panel>)}
    {["Lesson recap", "Written response", "Spoken response"].includes(b.format) && <p className="lw-preparation-prompt">{b.text}</p>}
    {auto && <div className="lw-preparation-response"><fieldset disabled={submitted} aria-label="Your answer">
      {isPairs ? b.pairs.map(pair => <Select key={pair.id} label={pair.left} value={a.answers[pair.id] || "Choose a match"} options={["Choose a match", ...b.pairs.map(pair => pair.right).reverse()]} onChange={value => setAnswer(pair.id, value === "Choose a match" ? "" : value)} />)
        : isSentence ? <><div className="lw-answer-tiles" aria-label="Your sentence">{a.order.length ? a.order.map(id => <button key={id} onClick={() => onChange({ order: a.order.filter(value => value !== id) })}>{b.parts.find(part => part.id === id)?.text} ×</button>) : <p className="lw-muted">Choose the words in order.</p>}</div><div className="lw-answer-tiles">{[...b.parts].reverse().map(part => <button disabled={a.order.includes(part.id) || submitted} key={part.id} onClick={() => onChange({ order: [...a.order, part.id] })}>{part.text}</button>)}</div></>
        : <Field label={isWords ? `What is “${word.meaning}” in French?` : "Your answer"} value={answer} onChange={value => setAnswer(item, value)} maxLength={4000} />}
    </fieldset>{!submitted ? <Button disabled={!filled} onClick={() => onChange({ submitted: [...a.submitted, item] })}>Submit answer</Button> : <Button secondary disabled={revealed} onClick={() => onChange({ revealed: [...a.revealed, item] })}>Reveal answer</Button>}
      {!submitted && <small>Submit your answer before revealing the teacher’s answer.</small>}
      {revealed && <div className={`lw-preparation-result ${correct ? "correct" : "incorrect"}`} role="status"><strong>{correct ? "Correct" : "Keep practicing"}</strong>{isPairs ? b.pairs.map(pair => <p key={pair.id}>{pair.left}: {a.answers[pair.id]} · Teacher’s answer: {pair.right}</p>) : <><p>Your answer: {answer}</p><p>Teacher’s answer: {answerKey(b, card)}</p></>}<p>A completed attempt counts toward preparation; it isn’t a proficiency assessment.</p></div>}
    </div>}
    {isWords && <div className="lw-inline-actions"><Button secondary disabled={card === 0} onClick={() => setCard(card - 1)}>Previous card</Button><Button secondary disabled={card === b.words.length - 1} onClick={() => setCard(card + 1)}>Next card</Button></div>}
    {b.purpose === "Teach" && <Button disabled={completed || b.format === "Flashcards" && !b.words.every(word => a.revealed.includes(word.id))} onClick={() => onChange({ acknowledged: true })}>{completed ? "Complete" : "Mark as complete"}</Button>}
    {b.purpose === "Teach" && b.format === "Flashcards" && !completed && <small>Reveal the meaning of each card, then mark this block complete.</small>}
    {b.purpose === "Practice" && !auto && <div className="lw-preparation-response"><fieldset disabled={a.submitted.includes("response")}><Field multiline label={b.format === "Spoken response" ? "Practice aloud, then write what you said" : "Your response"} value={a.answers.response || ""} onChange={value => setAnswer("response", value)} maxLength={4000} /></fieldset><Button disabled={!a.answers.response?.trim() || a.submitted.includes("response")} onClick={() => onChange({ submitted: [...a.submitted, "response"] })}>{a.submitted.includes("response") ? completed ? "Response saved" : "Response ready" : "Save response"}</Button><small>Your response is saved here for your session. Teacher review is not connected.</small></div>}
  </div>;
}
