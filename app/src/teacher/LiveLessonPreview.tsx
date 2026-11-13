import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useKeyboardInsets } from "../mobile";
import { Button, Icon } from "./components";
import { StudentBlock } from "./CourseContent";
import { moduleHeading, type Course } from "./course";

const PHONE = { width: 393, height: 780 };

/**
 * Live student view of one block at a time. It follows the block the teacher is
 * editing until the teacher interacts with the preview; "Follow editor" resumes.
 * StudentBlock is keyed by block id, so editing text never resets an answer.
 */
export function LiveLessonPreview({ course, followId, native = false }: { course: Course; followId?: string; native?: boolean }) {
  const sequence = course.modules.flatMap(module => module.blocks.map(block => ({ module, block })));
  const [following, setFollowing] = useState(true);
  const [index, setIndex] = useState(0);
  const followed = sequence.findIndex(item => item.block.id === followId);
  useEffect(() => { if (following && followed >= 0) setIndex(followed); }, [following, followed]);
  const position = Math.min(index, Math.max(0, sequence.length - 1)), current = sequence[position];
  // Desktop: scale a real phone-sized viewport to fit the panel instead of squeezing its layout.
  const stage = useRef<HTMLDivElement>(null), [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (native || !stage.current) return;
    // Leave room for the stage padding (16px) and the frame ring (8px) on each side.
    const fit = () => { const box = stage.current!.getBoundingClientRect(); setScale(Math.max(0.4, Math.min(1, (box.width - 48) / PHONE.width, (box.height - 48) / PHONE.height))); };
    fit();
    const observer = new ResizeObserver(fit); observer.observe(stage.current);
    return () => observer.disconnect();
  }, [native]);
  const { isKeyboardVisible } = useKeyboardInsets();
  const pause = () => setFollowing(false);
  const go = (to: number) => { pause(); setIndex(to); };
  const screen = !current ? <p className="ce-live-empty">Add a block to see the student view.</p> : <>
    <header className="ce-live-heading">
      <small>{course.title || "Untitled lesson"}</small>
      <strong>{moduleHeading(current.module)}</strong>
      <small>Block {position + 1} of {sequence.length}</small>
    </header>
    <div className="ce-live-body" onPointerDownCapture={pause} onKeyDownCapture={pause}>
      <StudentBlock key={current.block.id} block={current.block} language={course.language} />
    </div>
    <nav className="ce-live-nav" aria-label="Preview navigation">
      <Button kind="secondary" disabled={position === 0} onClick={() => go(position - 1)}>Previous</Button>
      <Button kind="secondary" disabled={position >= sequence.length - 1} onClick={() => go(position + 1)}>Next block</Button>
    </nav>
  </>;
  return (
    <section className={`ce-live-preview ${native ? "ce-live-native" : ""}`} aria-label="Student preview" data-keyboard={native && isKeyboardVisible}>
      <div className="ce-live-toolbar">
        <span><Icon name="person" size={16} />Student preview</span>
        {following ? <small className="ce-live-following">Following the editor</small> : <Button kind="quiet" onClick={() => setFollowing(true)}>Follow editor</Button>}
      </div>
      {native ? <div className="ce-live-screen">{screen}</div> : (
        <div className="ce-live-stage" ref={stage}>
          <div className="ce-live-frame" style={{ width: PHONE.width * scale, height: PHONE.height * scale }}>
            <div className="ce-live-screen" style={{ width: PHONE.width, height: PHONE.height, transform: `scale(${scale})` }}>{screen}</div>
          </div>
        </div>
      )}
    </section>
  );
}
