"use client";

import { useState, useTransition } from "react";
import { Bell, ChevronRight, Key, LogOut, ShieldCheck, Trash2, UserX } from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import type { TravelerProfile, UserSettings } from "../types";
import { Card, DangerButton, PageHeader, PrimaryButton, SecondaryButton } from "./shared";

export function SettingsPage({
  profile,
  settings,
}: {
  profile: TravelerProfile;
  settings: UserSettings;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  function handleChangePassword() {
    showToast({
      description: "Password changes require the auth provider and are disabled in this local preview.",
      title: "Security preview",
      type: "info",
    });
  }

  function handleSignOutAll() {
    startTransition(async () => {
      // Simulate a brief delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast({
        description: "All other signed-in devices have been signed out.",
        title: "Devices signed out",
        type: "success",
      });
    });
  }

  function handleToggleSetting(key: keyof UserSettings, currentValue: boolean) {
    startTransition(async () => {
      // Simulate persisting the setting
      await new Promise((resolve) => setTimeout(resolve, 300));
      showToast({
        description: `${key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} ${currentValue ? "disabled" : "enabled"}.`,
        title: "Preference saved",
        type: "success",
      });
    });
  }

  function handleDeactivate() {
    if (!showDeactivateConfirm) {
      setShowDeactivateConfirm(true);
      return;
    }

    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast({
        description: "Account deactivation is a backend action disabled in this local preview.",
        title: "Account deactivation",
        type: "info",
      });
      setShowDeactivateConfirm(false);
    });
  }

  const notificationSettings: Array<{
    key: keyof UserSettings;
    label: string;
    description: string;
  }> = [
    {
      key: "emailNotifications",
      label: "Email notifications",
      description: "Receive account and booking updates via email.",
    },
    {
      key: "pushNotifications",
      label: "Push notifications",
      description: "Get push notifications in your browser and mobile device.",
    },
    {
      key: "bookingUpdates",
      label: "Booking updates",
      description: "Notifications about booking confirmations, changes, and reminders.",
    },
    {
      key: "messageNotifications",
      label: "Message notifications",
      description: "Get notified when you receive a new message from hosts or support.",
    },
    {
      key: "marketingNotifications",
      label: "Offers and recommendations",
      description: "Travel inspiration, special offers, and personalized recommendations.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your account security, notifications, and preferences."
        title="Settings"
      />

      {/* ─── Login and Security ─── */}
      <Card className="p-5" id="security">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-dar-primary-soft text-dar-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-dar-navy">Login and security</h2>
            <p className="text-sm font-semibold text-dar-muted">Manage your password and account security settings.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-dar-muted">Password</label>
            <div className="flex h-11 items-center justify-between rounded-xl border border-dar-border bg-white px-3 text-sm">
              <span className="font-semibold text-dar-navy">••••••••</span>
              <SecondaryButton className="min-h-0 px-3 py-1.5 text-xs" onClick={handleChangePassword}>
                Change
              </SecondaryButton>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <PrimaryButton
              className="w-full"
              loading={isPending}
              loadingLabel="Signing out..."
              onClick={handleSignOutAll}
            >
              <LogOut className="size-4" />
              Sign out all devices
            </PrimaryButton>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            {
              checked: true,
              description: "Add an extra layer of security to your account.",
              icon: ShieldCheck,
              label: "Two-factor authentication",
              onChange: () =>
                showToast({
                  description: "Two-factor authentication setup requires the auth provider.",
                  title: "2FA preview",
                  type: "info",
                }),
            },
            {
              checked: true,
              description: "Receive a one-time code for every login attempt.",
              icon: Key,
              label: "Login with OTP",
              onChange: () =>
                showToast({
                  description: "OTP login configuration requires the auth provider.",
                  title: "OTP preview",
                  type: "info",
                }),
            },
          ].map((item) => (
            <label
              className="flex cursor-pointer items-center justify-between rounded-xl border border-dar-border p-4 transition hover:bg-dar-primary-soft"
              key={item.label}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <item.icon className="size-4 shrink-0 text-dar-primary" />
                  <span className="text-sm font-bold text-dar-navy">{item.label}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-dar-muted">{item.description}</p>
              </div>
              <input
                checked={item.checked}
                className="ml-3 h-5 w-10 shrink-0 accent-dar-primary"
                onChange={item.onChange}
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* ─── Notification Preferences ─── */}
      <Card className="p-5" id="notifications">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-500">
            <Bell className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-dar-navy">Notification preferences</h2>
            <p className="text-sm font-semibold text-dar-muted">Choose how and when you receive notifications.</p>
          </div>
        </div>

        <div className="mt-5 space-y-1">
          {notificationSettings.map(({ description, key, label }) => (
            <label
              className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition hover:bg-dar-primary-soft"
              key={key}
            >
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-dar-navy">{label}</span>
                <p className="mt-0.5 text-xs font-semibold text-dar-muted">{description}</p>
              </div>
              <input
                checked={settings[key] as boolean}
                className="ml-3 h-5 w-10 shrink-0 accent-dar-primary"
                defaultChecked={settings[key] as boolean}
                name={key}
                onChange={() => handleToggleSetting(key, settings[key] as boolean)}
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* ─── Account Management ─── */}
      <Card className="p-5" id="account">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-dar-error">
            <UserX className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-dar-navy">Account management</h2>
            <p className="text-sm font-semibold text-dar-muted">Manage your account status and data.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-dar-border p-4">
            <h3 className="text-sm font-black text-dar-navy">Deactivate account</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-dar-muted">
              Temporarily disable your account. Your profile, bookings, and reviews will not be visible. You can reactivate at any time by logging in.
            </p>
            {showDeactivateConfirm ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-bold text-dar-error">Are you sure you want to deactivate your account?</p>
                <div className="flex gap-3">
                  <SecondaryButton className="flex-1" onClick={() => setShowDeactivateConfirm(false)}>
                    Cancel
                  </SecondaryButton>
                  <DangerButton className="flex-1" loading={isPending} loadingLabel="Deactivating..." onClick={handleDeactivate}>
                    <Trash2 className="size-4" />
                    Deactivate
                  </DangerButton>
                </div>
              </div>
            ) : (
              <DangerButton className="mt-4 w-full" onClick={handleDeactivate}>
                <Trash2 className="size-4" />
                Deactivate account
              </DangerButton>
            )}
          </div>

          <div className="rounded-xl border border-dar-border p-4">
            <h3 className="text-sm font-black text-dar-navy">Delete account</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-dar-muted">
              Permanently delete your account and all associated data. This action cannot be undone. All active bookings must be completed first.
            </p>
            <DangerButton
              className="mt-4 w-full"
              onClick={() =>
                showToast({
                  description: "Account deletion is a backend action disabled in this local preview.",
                  title: "Account deletion",
                  type: "info",
                })
              }
            >
              <UserX className="size-4" />
              Delete account
            </DangerButton>
          </div>
        </div>
      </Card>

      {/* ─── Session Info ─── */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-dar-navy">Current session</p>
            <p className="mt-1 text-xs font-semibold text-dar-muted">
              Signed in as <span className="text-dar-navy">{profile.email}</span>
            </p>
            <p className="text-xs font-semibold text-dar-muted">
              Account type: <span className="text-dar-navy capitalize">{profile.accountType}</span>
            </p>
          </div>
          <ChevronRight className="size-5 text-dar-muted" />
        </div>
      </Card>
    </div>
  );
}
