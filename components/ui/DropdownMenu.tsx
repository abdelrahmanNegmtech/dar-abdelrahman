"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

/* ── Trigger ── */

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/* ── Content (no positioning animation, stable z-50) ── */

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className = "", sideOffset = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      avoidCollisions={false}
      className={`z-50 min-w-[220px] overflow-hidden rounded-xl border border-dar-border bg-white p-1 shadow-xl data-[state=open]:block ${className}`}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

/* ── Item ── */

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-dar-navy outline-none transition hover:bg-dar-primary-soft hover:text-dar-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 ${className}`}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

/* ── Separator ── */

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={`my-1 border-t border-dar-border ${className}`}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

/* ── Root ── */

export const DropdownMenu = DropdownMenuPrimitive.Root;
