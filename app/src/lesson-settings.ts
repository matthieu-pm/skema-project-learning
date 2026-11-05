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
