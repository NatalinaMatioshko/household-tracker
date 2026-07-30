"use client";

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { formatDateUk } from "./types";

const WEEKDAYS_UK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"] as const;

const MONTHS_UK = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
] as const;

const MOBILE_BREAKPOINT = 640;

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

type PopoverCoords = {
  top: number;
  left: number;
  width: number;
  maxHeight?: number;
  sheet: boolean;
};

export interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** FoB mint pill trigger for summary rows */
  variant?: "default" | "pill";
  "aria-label"?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  allowClear = false,
  placeholder = "Оберіть дату",
  className = "",
  disabled = false,
  variant = "default",
  "aria-label": ariaLabel,
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const popoverId = `${inputId}-popover`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);

  const selected = useMemo(() => parseIsoDate(value), [value]);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected ?? new Date()),
  );

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const sheet = window.innerWidth < MOBILE_BREAKPOINT;
    if (sheet) {
      const gutter = 12;
      const width = Math.min(window.innerWidth - gutter * 2, 420);
      const left = (window.innerWidth - width) / 2;
      const maxHeight = Math.min(window.innerHeight * 0.72, 440);
      setCoords({
        top: Math.max(12, window.innerHeight - maxHeight - gutter),
        left,
        width,
        maxHeight,
        sheet: true,
      });
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const popoverWidth = Math.max(rect.width, 288);
    const left = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - popoverWidth - 8,
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 340;
    const openUp = spaceBelow < estimatedHeight && rect.top > spaceBelow;
    const top = openUp
      ? Math.max(8, rect.top - estimatedHeight - 8)
      : Math.min(rect.bottom + 8, window.innerHeight - 16);

    setCoords({ top, left, width: popoverWidth, sheet: false });
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      document.body.style.overflow = "hidden";
    }

    const onReposition = () => updatePosition();
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
      setCoords(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
        setCoords(null);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const displayLabel = selected ? formatDateUk(value) : placeholder;
  const monthLabel = `${MONTHS_UK[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

  const closeAndFocus = () => {
    setOpen(false);
    setCoords(null);
    triggerRef.current?.focus();
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
      setCoords(null);
      return;
    }
    setViewMonth(startOfMonth(selected ?? new Date()));
    setOpen(true);
    requestAnimationFrame(() => {
      updatePosition();
    });
  };

  const sheetOpen = Boolean(coords?.sheet);

  const popover =
    open && isClient && coords
      ? createPortal(
          <>
            {sheetOpen ? (
              <button
                type="button"
                className="datepicker-sheet-backdrop animate-fade"
                aria-label="Закрити календар"
                onClick={closeAndFocus}
              />
            ) : null}
            <div
              ref={popoverRef}
              id={popoverId}
              role="dialog"
              aria-modal={sheetOpen}
              aria-label="Календар"
              className={`datepicker-popover animate-scale${sheetOpen ? " is-sheet" : ""}`}
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight,
              }}
            >
              {sheetOpen ? (
                <div className="datepicker-sheet-handle" aria-hidden="true" />
              ) : null}

              <div className="datepicker-nav">
                <button
                  type="button"
                  className="datepicker-nav-btn"
                  aria-label="Попередній місяць"
                  onClick={() =>
                    setViewMonth(
                      new Date(
                        viewMonth.getFullYear(),
                        viewMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                >
                  ‹
                </button>
                <div className="datepicker-month-label">{monthLabel}</div>
                <button
                  type="button"
                  className="datepicker-nav-btn"
                  aria-label="Наступний місяць"
                  onClick={() =>
                    setViewMonth(
                      new Date(
                        viewMonth.getFullYear(),
                        viewMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                >
                  ›
                </button>
              </div>

              <div className="datepicker-weekdays" aria-hidden="true">
                {WEEKDAYS_UK.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div
                className="datepicker-grid"
                role="grid"
                aria-label={monthLabel}
              >
                {cells.map((date, index) => {
                  if (!date) {
                    return (
                      <span
                        key={`empty-${index}`}
                        className="datepicker-day is-empty"
                      />
                    );
                  }

                  const iso = toIsoDate(date);
                  const isSelected = Boolean(
                    selected && sameDay(date, selected),
                  );
                  const isToday = sameDay(date, today);

                  return (
                    <button
                      key={iso}
                      type="button"
                      role="gridcell"
                      className={`datepicker-day${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}`}
                      aria-selected={isSelected}
                      aria-label={formatDateUk(iso)}
                      onClick={() => {
                        onChange(iso);
                        closeAndFocus();
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="datepicker-footer">
                <button
                  type="button"
                  className="btn btn-ghost min-h-11 px-3 text-sm"
                  onClick={() => {
                    const iso = toIsoDate(today);
                    onChange(iso);
                    setViewMonth(startOfMonth(today));
                    closeAndFocus();
                  }}
                >
                  Сьогодні
                </button>
                {allowClear ? (
                  <button
                    type="button"
                    className="btn btn-ghost min-h-11 px-3 text-sm"
                    onClick={() => {
                      onChange("");
                      closeAndFocus();
                    }}
                  >
                    Очистити
                  </button>
                ) : null}
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  const isPill = variant === "pill";
  const triggerClass = [
    "datepicker-trigger",
    isPill ? "datepicker-trigger-pill" : "field",
    selected ? "has-value" : "is-empty",
    open ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`datepicker${isPill ? " datepicker-pill" : ""} ${className}`.trim()}
    >
      <button
        ref={triggerRef}
        type="button"
        id={inputId}
        className={triggerClass}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={toggleOpen}
      >
        <span className="datepicker-trigger-label">{displayLabel}</span>
        <span className="datepicker-trigger-icon" aria-hidden="true">
          {isPill ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="3.5"
                y="5"
                width="17"
                height="15.5"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M8 3.5v3.5M16 3.5v3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </button>
      {popover}
    </div>
  );
};

export default DatePicker;
