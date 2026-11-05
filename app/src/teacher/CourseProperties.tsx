import { Button, Select, TextField } from "./components";
import { MediaUpload } from "./CourseContent";
import {
  autoAssessed,
  blockIssues,
  createBlock,
  id,
  moduleTypes,
  partRoles,
  practiceFormats,
  teachFormats,
  totalMinutes,
  word,
  type Course,
  type CourseBlock,
  type CourseModule,
  type Format,
  type ModuleType,
  type Purpose,
} from "./course";

export function BlockProperties({
  block: b,
  change,
}: {
  block: CourseBlock;
  change: (b: CourseBlock) => void;
}) {
  const edit = (patch: Partial<CourseBlock>) => change({ ...b, ...patch });
  const vocabulary = [
    "Flashcards",
    "Vocabulary recall",
    "Useful phrases",
  ].includes(b.format);
  return (
    <>
      <Select
        label="Block purpose"
        value={b.purpose}
        options={["Teach", "Practise"]}
        onChange={(v) => edit({ purpose: v as Purpose })}
      />
      <Select
        label="Block type"
        value={b.format}
        options={[
          ...new Set([
            b.format,
            ...(b.purpose === "Teach" ? teachFormats : practiceFormats),
          ]),
        ]}
        onChange={(v) => edit({ format: v as Format })}
      />
      <TextField
        label="Block title"
        value={b.title}
        onChange={(v) => edit({ title: v })}
      />
      <TextField
        label="Student instructions"
        multiline
        value={b.instructions}
        onChange={(v) => edit({ instructions: v })}
      />
      {vocabulary && (
        <>
          <h3>Words and key phrases</h3>
          <p className="tw-subtle">
            Add the foreign language, English meaning, picture and pronunciation
            for each card.
          </p>
          {b.words.map((w, i) => (
            <section className="ce-property-item" key={w.id}>
              <strong>Card {i + 1}</strong>
              <TextField
                label={`Word or phrase ${i + 1}`}
                value={w.word}
                onChange={(v) =>
                  edit({
                    words: b.words.map((x) =>
                      x.id === w.id ? { ...x, word: v } : x,
                    ),
                  })
                }
              />
              <TextField
                label={`English meaning ${i + 1}`}
                value={w.meaning}
                onChange={(v) =>
                  edit({
                    words: b.words.map((x) =>
                      x.id === w.id ? { ...x, meaning: v } : x,
                    ),
                  })
                }
              />
              <Select
                label={`Library picture ${i + 1}`}
                value={w.picture}
                options={["☕", "🍵", "🍎", "📚", "🏠", "✈️", "⚖️", "↔️", "💬"]}
                onChange={(v) =>
                  edit({
                    words: b.words.map((x) =>
                      x.id === w.id
                        ? { ...x, picture: v, imageId: undefined }
                        : x,
                    ),
                  })
                }
              />
              <MediaUpload
                label={`Upload card picture ${i + 1}`}
                accept="image/*"
                onSave={(assetId) =>
                  edit({
                    words: b.words.map((x) =>
                      x.id === w.id ? { ...x, imageId: assetId } : x,
                    ),
                  })
                }
              />
              <TextField
                label={`Pronunciation text ${i + 1}`}
                value={w.pronunciation}
                onChange={(v) =>
                  edit({
                    words: b.words.map((x) =>
                      x.id === w.id ? { ...x, pronunciation: v } : x,
                    ),
                  })
                }
              />
              <MediaUpload
                label={`Upload pronunciation ${i + 1}`}
                accept="audio/*"
                onSave={(assetId) =>
                  edit({
                    words: b.words.map((x) =>
                      x.id === w.id ? { ...x, assetId } : x,
                    ),
                  })
                }
              />
              <p className="tw-subtle">
                Without an audio file, preview uses generated pronunciation.
              </p>
              <Button
                kind="quiet"
                onClick={() =>
                  edit({ words: b.words.filter((x) => x.id !== w.id) })
                }
              >
                Delete card {i + 1}
              </Button>
            </section>
          ))}
          <Button
            kind="secondary"
            icon="plus"
            onClick={() =>
              edit({
                words: [
                  ...b.words,
                  { ...word(), word: "", meaning: "", pronunciation: "" },
                ],
              })
            }
          >
            Add word or phrase
          </Button>
        </>
      )}
      {b.format === "Sentence construction" && (
        <>
          <TextField
            label="English translation"
            value={b.translation}
            onChange={(v) => edit({ translation: v })}
          />
          <h3>Sentence parts</h3>
          <p className="tw-subtle">
            Order these as the correct sentence. Students receive rearranged
            tiles.
          </p>
          {b.parts.map((p, i) => (
            <section key={p.id} className="ce-property-item">
              <TextField
                label={`Sentence part ${i + 1}`}
                value={p.text}
                onChange={(v) => {
                  const parts = b.parts.map((x) =>
                    x.id === p.id ? { ...x, text: v } : x,
                  );
                  edit({ parts, answer: parts.map((x) => x.text).join(" ") });
                }}
              />
              <Select
                label={`Sentence role ${i + 1}`}
                value={partRoles.includes(p.role) ? p.role : "Custom"}
                options={partRoles}
                onChange={(v) =>
                  edit({
                    parts: b.parts.map((x) =>
                      x.id === p.id ? { ...x, role: v } : x,
                    ),
                  })
                }
              />
              {(!partRoles.includes(p.role) || p.role === "Custom") && (
                <TextField
                  label={`Custom role ${i + 1}`}
                  value={p.role === "Custom" ? "" : p.role}
                  onChange={(v) =>
                    edit({
                      parts: b.parts.map((x) =>
                        x.id === p.id ? { ...x, role: v || "Custom" } : x,
                      ),
                    })
                  }
                />
              )}
              <TextField
                label={`Explanation or substitution ${i + 1}`}
                value={p.note}
                onChange={(v) =>
                  edit({
                    parts: b.parts.map((x) =>
                      x.id === p.id ? { ...x, note: v } : x,
                    ),
                  })
                }
              />
              <div className="ce-actions">
                <Button
                  kind="quiet"
                  disabled={i === 0}
                  onClick={() => {
                    const parts = [...b.parts];
                    [parts[i - 1], parts[i]] = [parts[i], parts[i - 1]];
                    edit({ parts, answer: parts.map((x) => x.text).join(" ") });
                  }}
                >
                  Earlier
                </Button>
                <Button
                  kind="quiet"
                  onClick={() => {
                    const parts = b.parts.filter((x) => x.id !== p.id);
                    edit({ parts, answer: parts.map((x) => x.text).join(" ") });
                  }}
                >
                  Delete part
                </Button>
              </div>
            </section>
          ))}
          <Button
            kind="secondary"
            onClick={() =>
              edit({
                parts: [
                  ...b.parts,
                  { id: id(), text: "", role: "Complement", note: "" },
                ],
              })
            }
          >
            Add sentence part
          </Button>
        </>
      )}
      {["Matching pairs", "Word sorting"].includes(b.format) && (
        <>
          <h3>
            {b.format === "Matching pairs"
              ? "Correct pairs"
              : "Items and correct groups"}
          </h3>
          {b.pairs.map((p, i) => (
            <section key={p.id} className="ce-property-item">
              <TextField
                label={`Item ${i + 1}`}
                value={p.left}
                onChange={(v) =>
                  edit({
                    pairs: b.pairs.map((x) =>
                      x.id === p.id ? { ...x, left: v } : x,
                    ),
                  })
                }
              />
              <TextField
                label={`${b.format === "Matching pairs" ? "Matching answer" : "Correct group"} ${i + 1}`}
                value={p.right}
                onChange={(v) =>
                  edit({
                    pairs: b.pairs.map((x) =>
                      x.id === p.id ? { ...x, right: v } : x,
                    ),
                  })
                }
              />
              <Button
                kind="quiet"
                onClick={() =>
                  edit({ pairs: b.pairs.filter((x) => x.id !== p.id) })
                }
              >
                Delete item
              </Button>
            </section>
          ))}
          <Button
            kind="secondary"
            onClick={() =>
              edit({ pairs: [...b.pairs, { id: id(), left: "", right: "" }] })
            }
          >
            Add item
          </Button>
        </>
      )}
      {["Audio", "Video"].includes(b.format) && (
        <>
          <h3>
            {b.format === "Audio" ? "Listening playlist" : "Video playlist"}
          </h3>
          {b.clips.map((c, i) => (
            <section className="ce-property-item" key={c.id}>
              <TextField
                label={`Clip title ${i + 1}`}
                value={c.title}
                onChange={(v) =>
                  edit({
                    clips: b.clips.map((x) =>
                      x.id === c.id ? { ...x, title: v } : x,
                    ),
                  })
                }
              />
              <MediaUpload
                label={`Upload ${b.format.toLowerCase()} ${i + 1}`}
                accept={b.format === "Audio" ? "audio/*" : "video/*"}
                onSave={(assetId, filename) =>
                  edit({
                    clips: b.clips.map((x) =>
                      x.id === c.id ? { ...x, assetId, filename } : x,
                    ),
                  })
                }
              />
              {c.filename && <small>{c.filename}</small>}
              <TextField
                multiline
                label={`Transcript ${i + 1}`}
                value={c.transcript}
                onChange={(v) =>
                  edit({
                    clips: b.clips.map((x) =>
                      x.id === c.id ? { ...x, transcript: v } : x,
                    ),
                  })
                }
              />
              <TextField
                label={`Model response to repeat ${i + 1}`}
                value={c.answer}
                onChange={(v) =>
                  edit({
                    clips: b.clips.map((x) =>
                      x.id === c.id ? { ...x, answer: v } : x,
                    ),
                  })
                }
              />
              <Button
                kind="quiet"
                onClick={() =>
                  edit({ clips: b.clips.filter((x) => x.id !== c.id) })
                }
              >
                Delete clip
              </Button>
            </section>
          ))}
          <Button
            kind="secondary"
            onClick={() =>
              edit({
                clips: [
                  ...b.clips,
                  { id: id(), title: "New clip", transcript: "", answer: "" },
                ],
              })
            }
          >
            Add {b.format.toLowerCase()} clip
          </Button>
          <p className="tw-subtle">
            Files stay on this device. Sample playback uses the transcript.
          </p>
        </>
      )}
      {!vocabulary &&
        ![
          "Sentence construction",
          "Matching pairs",
          "Word sorting",
          "Audio",
          "Video",
        ].includes(b.format) && (
          <TextField
            label={
              b.format === "Fill the gap"
                ? "Sentence with a gap (use ___)"
                : ["Written response", "Spoken response", "Role-play"].includes(
                      b.format,
                    )
                  ? "Student prompt"
                  : b.format === "Quiz"
                    ? "Question"
                    : "Content or notes"
            }
            multiline
            value={b.text}
            onChange={(v) => edit({ text: v })}
          />
        )}
      {b.format === "Quiz" && (
        <>
          <h3>Answer options</h3>
          {b.choices.map((choice, i) => (
            <div className="ce-property-item" key={i}>
              <TextField
                label={`Option ${i + 1}`}
                value={choice}
                onChange={(v) =>
                  edit({
                    choices: b.choices.map((x, j) => (j === i ? v : x)),
                    answer: b.answer === choice ? v : b.answer,
                  })
                }
              />
              <Button
                kind="quiet"
                disabled={b.choices.length <= 2}
                onClick={() =>
                  edit({
                    choices: b.choices.filter((_, j) => j !== i),
                    answer: b.answer === choice ? "" : b.answer,
                  })
                }
              >
                Delete option
              </Button>
            </div>
          ))}
          <Button
            kind="secondary"
            onClick={() => edit({ choices: [...b.choices, ""] })}
          >
            Add option
          </Button>
          <Select
            label="Correct quiz answer"
            value={b.answer}
            options={[
              { value: "", label: "Choose correct answer" },
              ...b.choices.filter(Boolean),
            ]}
            onChange={(v) => edit({ answer: v })}
          />
        </>
      )}
      {autoAssessed(b) &&
        ![
          "Matching pairs",
          "Word sorting",
          "Flashcards",
          "Vocabulary recall",
          "Quiz",
        ].includes(b.format) && (
          <TextField
            label="Correct answer"
            value={b.answer}
            onChange={(v) => edit({ answer: v })}
          />
        )}
      {autoAssessed(b) &&
        ![
          "Matching pairs",
          "Word sorting",
          "Flashcards",
          "Vocabulary recall",
          "Quiz",
        ].includes(b.format) && (
          <>
            <TextField
              label="Other accepted answers (one per line)"
              multiline
              value={b.alternatives}
              onChange={(v) => edit({ alternatives: v })}
            />
            <p className="tw-subtle">
              Case and extra spaces are ignored. Accents and punctuation must
              match.
            </p>
          </>
        )}
      {b.format === "Image" && (
        <>
          <Select
            label="Library image"
            value={b.picture}
            options={["☕", "🍵", "🍎", "📚", "🏠", "✈️", "⚖️", "💬"]}
            onChange={(v) => edit({ picture: v, assetId: undefined })}
          />
          <MediaUpload
            label="Upload image"
            accept="image/*"
            onSave={(assetId, filename) => edit({ assetId, filename })}
          />
        </>
      )}
      {b.format === "Document" && (
        <>
          <MediaUpload
            label="Attach document"
            accept=".pdf,.txt,.doc,.docx,.rtf"
            onSave={(assetId, filename) => edit({ assetId, filename })}
          />
          {b.filename && <p>{b.filename}</p>}
        </>
      )}
      {b.purpose === "Practise" && !autoAssessed(b) && (
        <p className="ce-info">
          Responses go to the teacher for review. No automatic grade.
        </p>
      )}
      {blockIssues(b).length > 0 && (
        <div className="ce-warning">
          <strong>Before students try this block</strong>
          {blockIssues(b).map((s) => (
            <p key={s}>{s}</p>
          ))}
        </div>
      )}
    </>
  );
}

export function CourseProperties({
  tab,
  course: c,
  module: m,
  block: b,
  onTab,
  changeCourse,
  changeModule,
  changeBlock,
  addModule,
  deleteModule,
  addBlock,
  deleteBlock,
}: {
  tab: string;
  course: Course;
  module?: CourseModule;
  block?: CourseBlock;
  onTab: (v: string) => void;
  changeCourse: (c: Course) => void;
  changeModule: (m: CourseModule) => void;
  changeBlock: (b: CourseBlock) => void;
  addModule: () => void;
  deleteModule: () => void;
  addBlock: () => void;
  deleteBlock: () => void;
}) {
  return (
    <aside className="ce-properties">
      <div className="ce-tabs" aria-label="Properties">
        {["Lesson", "Module", "Block"].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => onTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="ce-property-content">
        {tab === "Lesson" ? (
          <>
            <h2>Lesson properties</h2>
            <TextField
              label="Lesson title"
              value={c.title}
              onChange={(v) => changeCourse({ ...c, title: v })}
            />
            <TextField
              label="Lesson learning goal"
              multiline
              value={c.goal}
              onChange={(v) => changeCourse({ ...c, goal: v })}
            />
            <Select
              label="Language"
              value={c.language}
              options={[
                "French",
                "English",
                "Spanish",
                "German",
                "Italian",
                "Japanese",
                c.language,
              ].filter((v, i, a) => a.indexOf(v) === i)}
              onChange={(v) => changeCourse({ ...c, language: v })}
            />
            <Select
              label="Level"
              value={c.level}
              options={["A1", "A2", "B1", "B2", "C1", "C2"]}
              onChange={(v) => changeCourse({ ...c, level: v })}
            />
            <section className="ce-duration">
              <strong>Total lesson time · {totalMinutes(c)} min</strong>
              {c.modules.map((x) => (
                <div key={x.id}>
                  <span>{x.title}</span>
                  <span>{x.minutes} min</span>
                </div>
              ))}
            </section>
          </>
        ) : tab === "Module" ? (
          <>
            <h2>Module properties</h2>
            {m ? (
              <>
                <Select
                  label="Module type"
                  value={m.type}
                  options={[...moduleTypes]}
                  onChange={(v) =>
                    changeModule({ ...m, type: v as ModuleType })
                  }
                />
                <TextField
                  label="Module title"
                  value={m.title}
                  onChange={(v) => changeModule({ ...m, title: v })}
                />
                <TextField
                  label="Module learning goal"
                  multiline
                  value={m.goal}
                  onChange={(v) => changeModule({ ...m, goal: v })}
                />
                <TextField
                  label="Estimated minutes"
                  type="number"
                  min="1"
                  max="240"
                  value={String(m.minutes)}
                  onChange={(v) => changeModule({ ...m, minutes: Number(v) })}
                />
                <Button kind="danger" onClick={deleteModule}>
                  Delete module
                </Button>
              </>
            ) : (
              <p>Select a module in the lesson outline.</p>
            )}
            <Button kind="secondary" onClick={addModule}>
              Add module
            </Button>
          </>
        ) : (
          <>
            <h2>Block properties</h2>
            {b ? (
              <>
                <BlockProperties block={b} change={changeBlock} />
                <Button kind="danger" onClick={deleteBlock}>
                  Delete block
                </Button>
              </>
            ) : (
              <p>Select a block to edit its content.</p>
            )}
            <Button kind="secondary" disabled={!m} onClick={addBlock}>
              Add block
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
