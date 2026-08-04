import type { ComponentType, ReactNode, SVGProps } from "react";

export type SystemStateVariant = "success" | "warning" | "error" | "info";

export type StateIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type EmptyStateAction = {
  href?: string;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export type ToastMessage = {
  description: string;
  id: string;
  title: string;
  type: SystemStateVariant;
};

export type ToastInput = Omit<ToastMessage, "id">;

export type ErrorStateConfig = {
  actions?: EmptyStateAction[];
  description: string;
  icon?: ReactNode;
  title: string;
  variant?: SystemStateVariant;
};
