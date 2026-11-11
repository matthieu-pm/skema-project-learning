import { useState } from "react";
import { Popover } from "radix-ui";
import { BottomSheet, useKeyboard } from "../mobile";
import {
  Button,
  Icon,
  PageHeading,
  Select,
  TextField,
  useWorkspace,
} from "./components";
import { uid } from "./model";
import {
  availabilityErrors,
  copyDayHours,
  dayHoursError,
  nextTimeRange,
  weekdays,
  type Availability,
  type Weekday,
} from "./availability";

function CopyHours({
  day,
  onCopy,
}: {
  day: Weekday;
  onCopy: (targets: Weekday[]) => void;
}) {
  const { mobile, availability } = useWorkspace();
  const keyboard = useKeyboard();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Weekday[]>([]);
  const days = weekdays.filter((item) => item.id !== day);
  const changeOpen = (next: boolean) => {
    keyboard.hide();
    if (next)
      setSelected(
        days
          .filter((item) => availability.week[item.id].enabled)
          .map((item) => item.id),
      );
    setOpen(next);
  };
  const label = `Copy ${weekdays.find((item) => item.id === day)!.label} hours`;
  const trigger = (
    <button
      className="tw-icon-button av-icon-button"
      aria-label={label}
      title={label}
      onClick={mobile ? () => changeOpen(true) : undefined}
    >
      <Icon name="copy" size={16} />
    </button>
  );
  const content = (
    <div className="av-copy-content">
      <label className="av-copy-day">
        <input
          type="checkbox"
          checked={selected.length === days.length}
          onChange={(event) =>
            setSelected(event.target.checked ? days.map((item) => item.id) : [])
          }
        />
        Select all
      </label>
      {days.map((item) => (
        <label className="av-copy-day" key={item.id}>
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={(event) =>
              setSelected((values) =>
                event.target.checked
                  ? [...values, item.id]
                  : values.filter((value) => value !== item.id),
              )
            }
          />
          {item.label}
        </label>
      ))}
      <div className="av-copy-actions">
        <Button kind="quiet" onClick={() => changeOpen(false)}>
          Cancel
        </Button>
        <Button
          disabled={!selected.length}
          onClick={() => {
            onCopy(selected);
            changeOpen(false);
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
  if (mobile)
    return (
      <>
        {trigger}
        <BottomSheet
          open={open}
          onOpenChange={changeOpen}
          title="Copy hours to"
          snap={0.72}
        >
          <div className="teacher-workspace av-copy-sheet">{content}</div>
        </BottomSheet>
      </>
    );
  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="teacher-workspace av-copy-popover"
          side="bottom"
          align="end"
          sideOffset={6}
          aria-label="Copy hours to"
        >
          <h3>Copy hours to</h3>
          {content}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default function AvailabilityPage() {
  const {
    availability,
    setAvailability,
    availabilitySaved,
    setAvailabilitySaved,
    attempt,
    setNotice,
  } = useWorkspace();
  const [showErrors, setShowErrors] = useState(false);
  const errors = availabilityErrors(availability);
  const change = (next: Availability) => {
    setAvailability(next);
    setAvailabilitySaved(false);
  };
  const save = () => {
    setShowErrors(true);
    if (Object.keys(errors).length) return;
    attempt(
      () => setAvailabilitySaved(true),
      "Availability saved in this preview. Confirmed bookings are preserved.",
    );
  };
  return (
    <div className="av-page">
      <PageHeading
        title="Availability"
        description="Choose the hours you’re available to teach."
        action={
          <div className="av-save">
            <span role="status">
              {availabilitySaved ? "Changes saved" : "Unsaved changes"}
            </span>
            <Button onClick={save}>Save availability</Button>
          </div>
        }
      />
      <div className="av-layout">
        <section className="av-week" aria-labelledby="av-week-title">
          <div className="av-section-heading">
            <h2 id="av-week-title">Weekly hours</h2>
            <p>Set your teaching times for each day.</p>
          </div>
          {weekdays.map(({ id, label }) => {
            const day = availability.week[id];
            const error = showErrors ? errors[id] : undefined;
            const updateDay = (next: typeof day) =>
              change({
                ...availability,
                week: { ...availability.week, [id]: next },
              });
            return (
              <div
                className={`av-day${!day.enabled ? " av-day-off" : ""}`}
                key={id}
                data-day={id}
              >
                <div className="av-day-label">
                  <button
                    role="switch"
                    aria-checked={day.enabled}
                    aria-label={`${label} availability`}
                    className="av-switch"
                    onClick={() => updateDay({ ...day, enabled: !day.enabled })}
                  >
                    <span />
                  </button>
                  <strong>{label}</strong>
                </div>
                {day.enabled ? (
                  <div className="av-day-hours">
                    <div className="av-day-ranges">
                      {day.ranges.map((range, index) => (
                        <div className="av-range" key={range.id}>
                          <TextField
                            label={`${label} start time ${index + 1}`}
                            type="time"
                            value={range.start}
                            error={error && index === 0 ? error : undefined}
                            onChange={(start) =>
                              updateDay({
                                ...day,
                                ranges: day.ranges.map((item) =>
                                  item.id === range.id
                                    ? { ...item, start }
                                    : item,
                                ),
                              })
                            }
                          />
                          <span className="av-range-dash" aria-hidden="true">
                            –
                          </span>
                          <TextField
                            label={`${label} end time ${index + 1}`}
                            type="time"
                            value={range.end}
                            onChange={(end) =>
                              updateDay({
                                ...day,
                                ranges: day.ranges.map((item) =>
                                  item.id === range.id
                                    ? { ...item, end }
                                    : item,
                                ),
                              })
                            }
                          />
                          <button
                            className="tw-icon-button av-icon-button"
                            aria-label={`Remove ${label} time range ${index + 1}`}
                            onClick={() => {
                              const ranges = day.ranges.filter(
                                (item) => item.id !== range.id,
                              );
                              updateDay({
                                enabled: ranges.length > 0,
                                ranges: ranges.length ? ranges : [{ ...range }],
                              });
                            }}
                          >
                            <Icon name="close" size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="av-day-actions">
                      <button
                        className="tw-icon-button av-icon-button"
                        aria-label={`Add ${label} time range`}
                        title="Add a time range"
                        disabled={!nextTimeRange(day.ranges, "check")}
                        onClick={() => {
                          const range = nextTimeRange(day.ranges, uid());
                          if (range)
                            updateDay({
                              ...day,
                              ranges: [...day.ranges, range],
                            });
                        }}
                      >
                        <Icon name="plus" size={17} />
                      </button>
                      <CopyHours
                        day={id}
                        onCopy={(targets) => {
                          if (dayHoursError(day)) {
                            setShowErrors(true);
                            return;
                          }
                          change(copyDayHours(availability, id, targets, uid));
                          setNotice(
                            `${label} hours copied to ${targets.length === 1 ? weekdays.find((item) => item.id === targets[0])!.label : `${targets.length} days`}. Save availability to keep this schedule in the preview.`,
                          );
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="av-unavailable">Unavailable</span>
                )}
              </div>
            );
          })}
          {showErrors && errors.week && (
            <p className="tw-error av-week-error" role="alert">
              {errors.week}
            </p>
          )}
          <div className="av-bookings-note">
            <h2>Existing bookings</h2>
            <p>
              Confirmed sessions stay reserved. Changing your hours won’t cancel
              a booking.
            </p>
          </div>
        </section>
        <aside className="av-settings" aria-label="Availability settings">
          <Select
            label="Time zone"
            value={availability.zone}
            options={[
              "Europe/Paris",
              "Europe/London",
              "America/New_York",
              "Asia/Tokyo",
            ]}
            onChange={(zone) => change({ ...availability, zone })}
          />
          {errors.zone && (
            <p className="tw-error" role="alert">
              {errors.zone}
            </p>
          )}
          <p className="av-preview-note">
            Changes stay in this preview session. Student availability isn’t
            synced.
          </p>
        </aside>
      </div>
    </div>
  );
}
