"use client";

import { useState } from "react";

import { Button, Input, Select, Card } from "@/features/design-system";

export function ScheduleReportCard() {
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("09:00 AM");
  const [email, setEmail] = useState("admin@dar.example");

  return (
    <Card
      padding="md"
      className="space-y-4 rounded-[0.7rem] border shadow-[0_2px_8px_rgba(16,25,58,0.03)]"
      style={{ borderColor: "#F4D29B" }}
    >
      <div>
        <h3 className="text-[14px] font-semibold text-foreground">Schedule report</h3>
        <p className="mt-1 text-[11px] leading-5 text-foreground-muted">
          Automate your reports and get them in your inbox.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-medium text-foreground-muted">Send every</label>
          <Select
            aria-label="Send every"
            value={day}
            onChange={(event) => setDay(event.target.value)}
            options={[{ label: "Monday", value: "Monday" }]}
            className="h-9 rounded-[0.4rem] text-[11px]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium text-foreground-muted">Time</label>
          <Select
            aria-label="Time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            options={[{ label: "09:00 AM", value: "09:00 AM" }]}
            className="h-9 rounded-[0.4rem] text-[11px]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium text-foreground-muted">Send to</label>
          <Input
            aria-label="Send to email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-9 rounded-[0.4rem] text-[11px]"
          />
        </div>
      </div>

      <Button variant="primary" size="sm" className="h-9 w-full rounded-[0.45rem] text-[11px]">
        Save schedule
      </Button>
    </Card>
  );
}
