import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/features/design-system/lib/cn";
import { badgeVariants, buttonVariants, cardVariants, inputVariants } from "@/features/design-system/lib/variants";
import type {
  BadgeTone,
  ButtonSize,
  ButtonVariant,
  CardTone,
  CardVariant,
  StatusVariant,
  TabItem,
} from "@/features/design-system/types";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  className,
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
}

type IconButtonProps = Omit<ButtonProps, "children"> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({ label, icon, className, ...props }: IconButtonProps) {
  return (
    <Button
      className={cn("aspect-square px-0", className)}
      aria-label={label}
      {...props}
    >
      {icon}
    </Button>
  );
}

type FieldWrapperProps = {
  label?: string;
  description?: string;
  error?: string;
  children: ReactNode;
};

function FieldWrapper({ label, description, error, children }: FieldWrapperProps) {
  return (
    <label className="flex w-full flex-col gap-2.5">
      {label ? <span className="text-[0.92rem] font-semibold text-foreground">{label}</span> : null}
      {children}
      {error ? (
        <span className="text-xs font-medium leading-5 text-danger">{error}</span>
      ) : description ? (
        <span className="text-xs leading-5 text-foreground-muted">{description}</span>
      ) : null}
    </label>
  );
}

type InputProps = ComponentPropsWithoutRef<"input"> & {
  label?: string;
  description?: string;
  error?: string;
};

export function Input({ label, description, error, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} description={description} error={error}>
      <input
        className={cn(inputVariants({ state: error ? "error" : "default" }), className)}
        {...props}
      />
    </FieldWrapper>
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  label?: string;
  description?: string;
  error?: string;
};

export function Textarea({
  label,
  description,
  error,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <FieldWrapper label={label} description={description} error={error}>
      <textarea
        rows={rows}
        className={cn(
          inputVariants({ state: error ? "error" : "default" }),
          "min-h-28 resize-y px-3.5 py-3",
          className,
        )}
        {...props}
      />
    </FieldWrapper>
  );
}

type SearchInputProps = Omit<InputProps, "type"> & {
  containerClassName?: string;
};

export function SearchInput({
  label,
  description,
  error,
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <FieldWrapper label={label} description={description} error={error}>
      <div
        className={cn(
          "flex items-center rounded-[var(--radius-md)] border bg-white px-4 shadow-[0_1px_2px_rgba(16,25,58,0.04)]",
          error
            ? "border-danger/50"
            : "border-border hover:border-border-strong focus-within:border-brand",
          containerClassName,
        )}
      >
        <Search className="size-4 text-foreground-subtle" aria-hidden="true" />
        <input
          type="search"
          className={cn(
            "h-12 w-full bg-transparent pl-3 text-sm text-foreground outline-none placeholder:text-foreground-subtle",
            className,
          )}
          {...props}
        />
      </div>
    </FieldWrapper>
  );
}

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label?: string;
  description?: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
};

export function Select({
  label,
  description,
  error,
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  return (
    <FieldWrapper label={label} description={description} error={error}>
      <div className="relative">
        <select
          className={cn(
            inputVariants({ state: error ? "error" : "default" }),
            "appearance-none pr-10",
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
          aria-hidden="true"
        />
      </div>
    </FieldWrapper>
  );
}

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  label: string;
  description?: string;
};

export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label htmlFor={checkboxId} className="flex items-start gap-3 text-sm text-foreground">
      <span className="relative mt-0.5 flex">
        <input
          id={checkboxId}
          type="checkbox"
          className={cn(
            "peer size-4 appearance-none rounded-[0.3rem] border border-border-strong bg-white shadow-[0_1px_2px_rgba(16,25,58,0.04)]",
            "checked:border-brand checked:bg-brand hover:border-brand/45",
            className,
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute left-0.5 top-0.5 size-3 text-white opacity-0 transition peer-checked:opacity-100" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-medium">{label}</span>
        {description ? (
          <span className="text-xs leading-5 text-foreground-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const statusToneMap: Record<StatusVariant, BadgeTone> = {
  active: "success",
  confirmed: "success",
  completed: "success",
  approved: "success",
  live: "success",
  pending: "warning",
  "under-review": "warning",
  "payment-review": "warning",
  processing: "info",
  rejected: "danger",
  cancelled: "danger",
  failed: "danger",
  disputed: "danger",
  suspended: "danger",
  draft: "neutral",
  open: "brand",
};

type StatusBadgeProps = {
  status: StatusVariant;
  children?: ReactNode;
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <Badge tone={statusToneMap[status]} className="capitalize">
      <span className="size-1.5 rounded-full bg-current/80 shadow-[0_0_0_2px_rgba(255,255,255,0.65)]" aria-hidden="true" />
      {children ?? status.replace(/-/g, " ")}
    </Badge>
  );
}

type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClass =
    size === "sm" ? "size-9 text-sm" : size === "lg" ? "size-14 text-lg" : "size-11 text-sm";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full border border-white/70 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(237,233,255,0.92)_58%,_rgba(226,217,255,0.9)_100%)] font-semibold text-brand shadow-[0_10px_24px_rgba(95,61,245,0.12)]",
        sizeClass,
      )}
      aria-label={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

type CardProps = ComponentPropsWithoutRef<"section"> & {
  variant?: CardVariant;
  tone?: CardTone;
  padding?: "none" | "sm" | "md" | "lg";
};

export function Card({
  className,
  variant,
  tone,
  padding,
  ...props
}: CardProps) {
  return <section className={cn(cardVariants({ variant, tone, padding }), className)} {...props} />;
}

type TabsProps = {
  items: TabItem[];
  value: string;
  className?: string;
  onValueChange?: (value: string) => void;
};

export function Tabs({ items, value, className, onValueChange }: TabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-[var(--radius-lg)] border border-border/95 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-2.5 shadow-[0_8px_24px_rgba(16,25,58,0.04)]",
        className,
      )}
      role="tablist"
      aria-label="Sections"
    >
      {items.map((item) => {
        const isActive = item.value === value;
        const content = (
          <>
            {item.icon ? <item.icon className="size-4" aria-hidden="true" /> : null}
            <span>{item.label}</span>
            {item.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.7rem] font-semibold shadow-[0_1px_1px_rgba(16,25,58,0.03)]",
                  isActive ? "bg-white/80 text-brand" : "bg-surface-strong text-foreground-muted",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </>
        );

        const classNames = cn(
          "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3.5 text-sm font-semibold",
          isActive
            ? "bg-brand-soft text-brand shadow-[0_8px_18px_rgba(95,61,245,0.08)]"
            : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
        );

        return item.href ? (
          <a
            key={item.value}
            href={item.href}
            className={classNames}
            role="tab"
            aria-selected={isActive}
          >
            {content}
          </a>
        ) : (
          <button
            key={item.value}
            type="button"
            className={classNames}
            role="tab"
            aria-selected={isActive}
            onClick={onValueChange ? () => onValueChange(item.value) : undefined}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Separator({ orientation = "horizontal", className }: SeparatorProps) {
  return (
    <div
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px min-h-6",
        "bg-border",
        className,
      )}
      aria-hidden="true"
    />
  );
}

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[linear-gradient(90deg,#eef2ff_0%,#f7f9ff_50%,#eef2ff_100%)]",
        className,
      )}
      aria-hidden="true"
    />
  );
}
