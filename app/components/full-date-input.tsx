"use client";

import { type KeyboardEvent, type ReactNode, type RefObject, useRef } from "react";
import { cn } from "@/lib/utils";

type NativeDateInput = HTMLInputElement & {
  showPicker?: () => void;
};

export function openNativeDatePicker(input: NativeDateInput | null) {
  if (!input || input.disabled) {
    return;
  }

  input.focus({ preventScroll: true });

  try {
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
  } catch {
    // Some browsers throw when showPicker is unavailable for the current gesture.
  }

  input.click();
}

export function FullDateInput({
  value,
  min,
  max,
  disabled = false,
  onChange,
  children,
  className,
  inputClassName,
  ariaLabel,
  inputRef,
}: {
  value: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  inputClassName?: string;
  ariaLabel: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const localRef = useRef<HTMLInputElement | null>(null);

  const setInputRef = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (inputRef && "current" in inputRef) {
      inputRef.current = node;
    }
  };

  const openPicker = () => {
    openNativeDatePicker(localRef.current as NativeDateInput | null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    openPicker();
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={openPicker}
      onKeyDown={onKeyDown}
      className={cn(
        "relative cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {children}
      <input
        ref={setInputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => onChange(event.currentTarget.value)}
        className={cn("pointer-events-none absolute inset-0 h-full w-full cursor-pointer opacity-0", inputClassName)}
      />
    </div>
  );
}
