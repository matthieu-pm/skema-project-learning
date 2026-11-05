import { useState } from "react";
import {
  Badge,
  Button,
  Panel,
  PageHeading,
  Select,
  TextField,
  useWorkspace,
  type Navigate,
} from "./components";
import FreeLessonConfirmation from "../FreeLessonConfirmation";
import {
  isFreeLesson,
  lessonDurations,
  lessonPriceLabel,
  lessonSettingsReady,
  validLessonSettings,
  type LessonSettings,
} from "../lesson-settings";
export default function LessonSettingsPage({
  navigate,
}: {
  navigate: Navigate;
}) {
  const {
    savedProfile,
    setSavedProfile,
    setProfile,
    setAvailabilitySaved,
    attempt,
  } = useWorkspace();
  const [settings, setSettings] = useState<LessonSettings>(() => ({
    duration: savedProfile.duration,
    rate: savedProfile.rate,
    freeConfirmed: savedProfile.freeConfirmed,
  }));
  const [preview, setPreview] = useState(false);
  const update = (patch: Partial<LessonSettings>) => {
    setSettings((old) => ({ ...old, ...patch }));
    setPreview(false);
  };
  return (
    <>
      <PageHeading
        title="Lesson settings"
        description="Set your session duration and price whenever you’re ready."
      />
      <Panel>
        <Badge tone={lessonSettingsReady(settings) ? "green" : "orange"}>
          {lessonSettingsReady(settings)
            ? "Lesson settings complete"
            : "Lesson settings incomplete"}
        </Badge>
        <p>
          These are bookable session settings. Module completion estimates stay
          separate.
        </p>
        {preview ? (
          <>
            <h2>Review lesson settings</h2>
            <p>Duration: {settings.duration || "Not set"}</p>
            <p>
              Price per lesson:{" "}
              {lessonPriceLabel(settings.rate, settings.freeConfirmed)}
            </p>
            <p>
              Changes apply to future lesson offers. Existing bookings are
              preserved.
            </p>
            <div className="tw-actions">
              <Button
                onClick={() => {
                  if (!validLessonSettings(settings)) return;
                  if (
                    attempt(() => {
                      setSavedProfile((old) => ({ ...old, ...settings }));
                      setProfile((old) => ({ ...old, ...settings }));
                      if (!lessonSettingsReady(settings))
                        setAvailabilitySaved(false);
                    }, "Lesson settings saved in this preview. Existing bookings are preserved.")
                  )
                    navigate({ page: "profile" });
                }}
              >
                Save lesson settings
              </Button>
              <Button kind="secondary" onClick={() => setPreview(false)}>
                Keep editing
              </Button>
            </div>
          </>
        ) : (
          <>
            <Select
              label="Lesson duration (optional)"
              value={settings.duration}
              options={[{ value: "", label: "Not set" }, ...lessonDurations]}
              onChange={(duration) => update({ duration })}
            />
            <TextField
              label="Price per lesson in euros (optional)"
              type="number"
              min="0"
              max="1000"
              value={settings.rate}
              placeholder="Leave blank to decide later"
              onChange={(rate) => update({ rate, freeConfirmed: false })}
            />
            {settings.rate.trim() &&
              !validLessonSettings({
                ...settings,
                duration: "",
                freeConfirmed: true,
              }) && (
                <p className="tw-error" role="alert">
                  Enter a price from €0 to €1,000.
                </p>
              )}
            {isFreeLesson(settings.rate) && (
              <FreeLessonConfirmation
                confirmed={settings.freeConfirmed}
                onChange={(freeConfirmed) => update({ freeConfirmed })}
              />
            )}
            <p className="tw-subtle">
              You can save an incomplete draft. Duration and a confirmed price
              are needed before publishing availability for new bookings.
            </p>
            <div className="tw-actions">
              <Button
                disabled={!validLessonSettings(settings)}
                onClick={() => setPreview(true)}
              >
                Review lesson settings
              </Button>
              <Button
                kind="quiet"
                onClick={() => navigate({ page: "profile" })}
              >
                Back to teaching profile
              </Button>
            </div>
          </>
        )}
      </Panel>
    </>
  );
}
