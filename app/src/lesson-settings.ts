export type LessonSettings = {
  duration: string;
  rate: string;
  freeConfirmed: boolean;
};
export const lessonDurations = ["30 minutes", "45 minutes", "60 minutes"];
export const isFreeLesson = (rate: string) =>
  rate.trim() !== "" && Number.isFinite(Number(rate)) && Number(rate) === 0;
export function validLessonSettings(
  value: LessonSettings,
  required = false,
): boolean {
  const duration = value.duration.trim(),
    rate = value.rate.trim();
  if (duration ? !lessonDurations.includes(duration) : required) return false;
  if (!rate) return !required;
  const amount = Number(rate);
  return (
    Number.isFinite(amount) &&
    amount >= 0 &&
    amount <= 1000 &&
    (amount !== 0 || value.freeConfirmed)
  );
}
export const lessonSettingsReady = (value: LessonSettings) =>
  validLessonSettings(value, true);
export function lessonPriceLabel(rate: string, freeConfirmed = false): string {
  if (!rate.trim()) return "Not set";
  return isFreeLesson(rate)
    ? freeConfirmed
      ? "Free (€0)"
      : "€0 — confirmation needed"
    : `€${rate}`;
}

// Templates remain reusable drafts; only student-facing publication needs terms.
export function lessonPublicationIssues(
  value: LessonSettings,
  forStudent: boolean,
): string[] {
  if (!forStudent || lessonSettingsReady(value)) return [];
  const issues: string[] = [];
  if (!lessonDurations.includes(value.duration))
    issues.push("Set your lesson duration in Edit teaching profile.");
  if (!value.rate.trim())
    issues.push("Set your price per lesson in Edit teaching profile.");
  else if (isFreeLesson(value.rate) && !value.freeConfirmed)
    issues.push("Confirm your free lesson price in Edit teaching profile.");
  else if (!validLessonSettings({ ...value, duration: "30 minutes" }, true))
    issues.push("Enter a price from €0 to €1,000 in Edit teaching profile.");
  return issues;
}
