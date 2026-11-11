import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Checkbox, Popover, Switch } from "radix-ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { BottomSheet, useFlow, useKeyboard } from "../mobile";
import { Button, Icon, PageHeading, Select, TextField, useWorkspace } from "./components";
import { Button as ActionButton } from "./ui/button";
import {
  availabilityWeekdays,
  copyWorkingHours,
  createWorkingTimeSlot,
  removeWorkingTimeSlot,
  updateWorkingDay,
  updateWorkingTimeSlot,
  validateWeeklyHours,
  workingDayError,
  type Availability,
  type AvailabilityWeekday,
  type WeeklyHoursValidation,
  type WorkingDay,
} from "./availability";
import "./availability.css";

function PhoneCopySheet({ open, onOpenChange, title, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  const flow = useFlow();
  const screenId = useRef(flow.current.id);
  const active = flow.current.id === screenId.current;
  useEffect(() => {
    if (!active && open) onOpenChange(false);
  }, [active, open, onOpenChange]);
  if (!active) return null;
  return <BottomSheet open={open} onOpenChange={onOpenChange} title={title} description="Replaces hours and turns selected days on." snap={0.8}>{children}</BottomSheet>;
}

function CopyHours({ day, label, hours, invalid, onCopy }: {
  day: AvailabilityWeekday;
  label: string;
  hours: WorkingDay;
  invalid: boolean;
  onCopy: (targets: AvailabilityWeekday[]) => void;
}) {
  const { mobile } = useWorkspace();
  const keyboard = useKeyboard();
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<AvailabilityWeekday[]>([]);
  const trigger = useRef<HTMLButtonElement>(null);
  const sheetContent = useRef<HTMLDivElement>(null);
  const restorePhoneFocus = useRef(false);
  const id = useId();
  const destinations = availabilityWeekdays.filter(([target]) => target !== day);
  const title = `Copy ${label} hours`;
  const changeOpen = (next: boolean) => {
    keyboard.hide();
    if (next) {
      setTargets([]);
      restorePhoneFocus.current = mobile;
    }
    setOpen(next);
  };
  // BottomSheet has no associated trigger. Wait for its exit to release the focus trap.
  useEffect(() => {
    if (!mobile || open || !restorePhoneFocus.current) return;
    let frame: number;
    const restore = () => {
      if (sheetContent.current?.isConnected) frame = requestAnimationFrame(restore);
      else {
        restorePhoneFocus.current = false;
        trigger.current?.focus({ preventScroll: true });
      }
    };
    frame = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(frame);
  }, [mobile, open]);
  const copy = () => {
    if (!targets.length || invalid) return;
    onCopy(targets);
    changeOpen(false);
  };
  const body = (
    <div className="tw-availability-copy-body" ref={sheetContent}>
      {!mobile && <h3 id={`${id}-title`}>{title}</h3>}
      <p className="tw-availability-copy-summary">{hours.slots.map((slot) => `${slot.start}–${slot.end}`).join(", ")}</p>
      <p id={`${id}-description`} className="tw-availability-copy-description">Replaces hours and turns selected days on.</p>
      <div className="tw-availability-copy-targets" role="group" aria-label="Copy hours to">
        <label className="tw-availability-copy-option tw-availability-copy-all">
          <Checkbox.Root
            className="tw-availability-checkbox"
            checked={targets.length === destinations.length ? true : targets.length ? "indeterminate" : false}
            onCheckedChange={(checked) => setTargets(checked ? destinations.map(([target]) => target) : [])}
          >
            <Checkbox.Indicator>{targets.length === destinations.length ? <Icon name="check" size={14} /> : <span className="tw-availability-checkbox-mixed" />}</Checkbox.Indicator>
          </Checkbox.Root>
          <span>Select all days</span>
        </label>
        {destinations.map(([target, targetLabel]) => (
          <label className="tw-availability-copy-option" key={target}>
            <Checkbox.Root
              className="tw-availability-checkbox"
              checked={targets.includes(target)}
              onCheckedChange={(checked) => setTargets((current) => checked ? [...current, target] : current.filter((value) => value !== target))}
            >
              <Checkbox.Indicator><Icon name="check" size={14} /></Checkbox.Indicator>
            </Checkbox.Root>
            <span>{targetLabel}</span>
          </label>
        ))}
      </div>
      <div className="tw-availability-copy-footer">
        <ActionButton variant="outline" onClick={() => changeOpen(false)}>Cancel</ActionButton>
        <ActionButton disabled={!targets.length || invalid} onClick={copy}>Copy hours</ActionButton>
      </div>
    </div>
  );
  const control = (
    <ActionButton ref={trigger} className="tw-availability-icon-action" variant="ghost" size="icon" static disabled={invalid} aria-label={title} title={title}>
      <HugeiconsIcon icon={Copy01Icon} size={18} strokeWidth={1.7} aria-hidden="true" />
    </ActionButton>
  );
  if (mobile) return <>
    <ActionButton ref={trigger} className="tw-availability-icon-action" variant="ghost" size="icon" static disabled={invalid} aria-label={title} title={title} onClick={() => changeOpen(true)}>
      <HugeiconsIcon icon={Copy01Icon} size={18} strokeWidth={1.7} aria-hidden="true" />
    </ActionButton>
    <PhoneCopySheet open={open} onOpenChange={changeOpen} title={title}>
      <div className="teacher-workspace tw-availability-copy-sheet">{body}</div>
    </PhoneCopySheet>
  </>;
  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Trigger asChild>{control}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="teacher-workspace tw-availability-copy-popover" sideOffset={8} align="end" collisionPadding={16} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
          {body}
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
  } = useWorkspace();
  const [errors, setErrors] = useState<WeeklyHoursValidation>({ dayErrors: {} });
  const [copyAnnouncement, setCopyAnnouncement] = useState("");
  const page = useRef<HTMLElement>(null);
  const addButtons = useRef<Partial<Record<AvailabilityWeekday, HTMLButtonElement | null>>>({});
  const keyboard = useKeyboard();
  const fieldId = useId();
  const change = (update: (current: Availability) => Availability) => {
    setAvailability(update);
    setAvailabilitySaved(false);
    setErrors({ dayErrors: {} });
    setCopyAnnouncement("");
  };
  const changeDay = (day: AvailabilityWeekday, patch: Partial<WorkingDay>) => change((current) => updateWorkingDay(current, day, patch));
  const addSlot = (day: AvailabilityWeekday) => {
    const slot = createWorkingTimeSlot();
    change((current) => updateWorkingDay(current, day, { slots: [...current.days[day].slots, slot] }));
    requestAnimationFrame(() => page.current?.querySelector<HTMLInputElement>(`[data-hours-slot="${slot.id}"] input`)?.focus());
  };
  const removeSlot = (day: AvailabilityWeekday, slotId: string) => {
    keyboard.hide();
    change((current) => removeWorkingTimeSlot(current, day, slotId));
    requestAnimationFrame(() => addButtons.current[day]?.focus({ preventScroll: true }));
  };
  const save = () => {
    const validation = validateWeeklyHours(availability.days);
    setErrors(validation);
    if (validation.scheduleError || Object.keys(validation.dayErrors).length) return;
    attempt(
      () => setAvailabilitySaved(true),
      "Availability saved. Confirmed bookings are preserved.",
    );
  };
  return (
    <section className="tw-availability" ref={page}>
      <PageHeading
        title="Availability"
        description="Choose your open hours. Existing bookings stay reserved."
        action={
          <div className="tw-availability-heading-actions">
            <span className="tw-availability-save-state" role="status">{availabilitySaved ? "Saved" : "Unsaved changes"}</span>
            <Button disabled={availability.zone !== "Europe/Paris"} onClick={save}>
              {availabilitySaved ? "Availability saved" : "Save availability"}
            </Button>
          </div>
        }
      />
      <span className="tw-availability-announcement" role="status">{copyAnnouncement}</span>
      <div className="tw-availability-layout">
        <div className="tw-availability-week">
          <div className="tw-availability-hours">
            <h2>Weekly hours</h2>
            <p className="tw-availability-hint">Choose the days you work and set their hours.</p>
          </div>
          <ul className="tw-availability-days" aria-label="Weekly availability">
            {availabilityWeekdays.map(([day, label]) => {
              const hours = availability.days[day];
              const selected = hours.enabled;
              const error = errors.dayErrors[day];
              const copyInvalid = !!workingDayError(day, hours);
              return (
                <li className={`tw-availability-day-row${selected ? " is-available" : ""}`} key={day}>
                  <label className="tw-availability-day" htmlFor={`${fieldId}-${day}`}>
                    <Switch.Root
                      id={`${fieldId}-${day}`}
                      data-slot="switch"
                      className="tw-availability-switch"
                      aria-label={label}
                      aria-describedby={!selected ? `${fieldId}-${day}-hours` : undefined}
                      checked={selected}
                      onCheckedChange={(enabled) => changeDay(day, { enabled })}
                    >
                      <Switch.Thumb data-slot="switch-thumb" className="tw-availability-switch-thumb" />
                    </Switch.Root>
                    <span>{label}</span>
                  </label>
                  {selected ? <>
                    <div className="tw-availability-day-content" role="group" aria-label={`${label} working hours`} aria-describedby={error ? `${fieldId}-${day}-error` : undefined}>
                      {hours.slots.map((slot, index) => (
                        <div className="tw-availability-slot-row" key={slot.id} data-hours-slot={slot.id} role="group" aria-label={`${label} time slot ${index + 1}`}>
                          <div className="tw-availability-day-range">
                            <TextField label={`${label} slot ${index + 1} start time`} type="time" value={slot.start} onChange={(start) => change((current) => updateWorkingTimeSlot(current, day, slot.id, { start }))} />
                            <span className="tw-availability-time-separator" aria-hidden="true">–</span>
                            <TextField label={`${label} slot ${index + 1} end time`} type="time" value={slot.end} onChange={(end) => change((current) => updateWorkingTimeSlot(current, day, slot.id, { end }))} />
                          </div>
                          {hours.slots.length > 1 && <ActionButton className="tw-availability-icon-action" variant="ghost" size="icon" static aria-label={`Remove ${label} time slot ${index + 1}`} title="Remove time slot" onClick={() => removeSlot(day, slot.id)}><Icon name="close" size={18} /></ActionButton>}
                        </div>
                      ))}
                      {error && <p id={`${fieldId}-${day}-error`} className="tw-error tw-availability-day-error" role="alert">{error}</p>}
                      {copyInvalid && <p className="tw-availability-copy-hint">Fix {label} hours before copying.</p>}
                    </div>
                    <div className="tw-availability-day-actions">
                      <ActionButton ref={(element) => { addButtons.current[day] = element; }} className="tw-availability-icon-action" variant="ghost" size="icon" static aria-label={`Add ${label} time slot`} title="Add time slot" onClick={() => addSlot(day)}><Icon name="plus" size={18} /></ActionButton>
                      <CopyHours day={day} label={label} hours={hours} invalid={copyInvalid} onCopy={(targets) => {
                        change((current) => copyWorkingHours(current, day, targets));
                        setCopyAnnouncement(`${label} hours copied to ${targets.map((target) => availabilityWeekdays.find(([key]) => key === target)![1]).join(", ")}. Save availability to keep these changes.`);
                      }} />
                    </div>
                  </> : <span id={`${fieldId}-${day}-hours`} className="tw-availability-day-hours">Unavailable</span>}
                </li>
              );
            })}
          </ul>
          {errors.scheduleError && <p className="tw-error tw-availability-error" role="alert">{errors.scheduleError}</p>}
        </div>
        <aside className="tw-availability-aside">
          <section className="tw-availability-zone" aria-label="Time zone settings">
            <Select
              label="Time zone"
              value={availability.zone}
              options={["Europe/Paris", "Europe/London", "America/New_York", "Asia/Tokyo"]}
              onChange={(zone) => change((current) => ({ ...current, zone }))}
            />
            <p className="tw-availability-hint">Scheduling uses Europe/Paris.</p>
            {availability.zone !== "Europe/Paris" && <p className="tw-error tw-availability-error" role="alert">Choose Europe/Paris to save your availability.</p>}
          </section>
          <section className="tw-availability-bookings">
            <h2>Existing bookings</h2>
            <p>Confirmed sessions are reserved automatically within these hours. Removing an open day does not cancel an existing booking.</p>
          </section>
        </aside>
      </div>
    </section>
  );
}
