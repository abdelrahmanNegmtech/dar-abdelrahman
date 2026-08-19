import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-semibold",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-[180ms,180ms,180ms,220ms,180ms] ease",
    "[.owner-dashboard-content_&]:hover:shadow-[var(--shadow-card-hover)]",
    "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white shadow-[0_10px_24px_rgba(86,49,216,0.28)] hover:bg-brand-strong [.owner-dashboard-content_&]:hover:bg-brand [.owner-dashboard-content_&]:hover:text-white active:scale-[0.98]",
        secondary:
          "bg-brand-soft text-brand hover:bg-[#ddd6ff] hover:text-brand-strong [.owner-dashboard-content_&]:hover:bg-brand-soft [.owner-dashboard-content_&]:hover:text-brand active:scale-[0.98]",
        outline:
          "border border-border bg-white text-foreground shadow-[0_3px_8px_rgba(16,25,58,0.06)] hover:border-brand/45 hover:text-brand [.owner-dashboard-content_&]:hover:border-border [.owner-dashboard-content_&]:hover:bg-white [.owner-dashboard-content_&]:hover:text-foreground active:scale-[0.98]",
        ghost:
          "bg-transparent text-foreground-muted hover:bg-surface-strong hover:text-foreground [.owner-dashboard-content_&]:hover:bg-transparent [.owner-dashboard-content_&]:hover:text-foreground-muted active:scale-[0.98]",
        success:
          "bg-success text-white shadow-[0_10px_24px_rgba(22,163,74,0.28)] hover:brightness-95 [.owner-dashboard-content_&]:hover:brightness-100 active:scale-[0.98]",
        warning:
          "bg-warning text-white shadow-[0_10px_24px_rgba(168,106,0,0.28)] hover:brightness-95 [.owner-dashboard-content_&]:hover:brightness-100 active:scale-[0.98]",
        "warning-outline":
          "border border-warning/40 bg-warning-soft text-warning hover:bg-[#ffeec4] [.owner-dashboard-content_&]:hover:bg-warning-soft [.owner-dashboard-content_&]:hover:text-warning active:scale-[0.98]",
        danger:
          "bg-danger text-white shadow-[0_10px_24px_rgba(239,68,68,0.28)] hover:brightness-95 [.owner-dashboard-content_&]:hover:brightness-100 active:scale-[0.98]",
        "danger-outline":
          "border border-danger/40 bg-danger-soft text-danger hover:bg-[#ffd4d4] [.owner-dashboard-content_&]:hover:bg-danger-soft [.owner-dashboard-content_&]:hover:text-danger active:scale-[0.98]",
      },
      size: {
        sm: "h-9 gap-1.5 rounded-[var(--radius-sm)] px-3.5 text-xs",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export const inputVariants = cva(
  [
    "flex h-12 w-full rounded-[var(--radius-md)] border bg-white px-3.5 text-sm text-foreground",
    "shadow-[0_1px_2px_rgba(16,25,58,0.04)] placeholder:text-foreground-subtle",
    "transition-[color,background-color,border-color,box-shadow] duration-[180ms,180ms,180ms,220ms] ease",
    "focus-visible:border-brand focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      state: {
        default: "border-border hover:border-border-strong",
        error: "border-danger/50 hover:border-danger/70",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export const cardVariants = cva(
  "rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-card)]",
  {
    variants: {
      variant: {
        standard: "",
        metric: "p-5",
        summary: "overflow-hidden",
        action: "cursor-pointer transition-shadow hover:shadow-[var(--shadow-card-hover)]",
        profile: "overflow-hidden p-0",
        alert: "border-l-4 border-l-brand",
      },
      tone: {
        light: "bg-white",
        dark: "bg-surface-dark text-[var(--sidebar-dark-foreground)] border-[var(--sidebar-dark-border)]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-5",
        lg: "p-7",
      },
    },
    defaultVariants: {
      variant: "standard",
      tone: "light",
      padding: "md",
    },
  },
);

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold leading-none shadow-[0_1px_1px_rgba(16,25,58,0.03)]",
  {
    variants: {
      tone: {
        neutral: "bg-surface-strong text-foreground-muted",
        brand: "bg-brand-soft text-brand",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        info: "bg-info-soft text-info",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);
