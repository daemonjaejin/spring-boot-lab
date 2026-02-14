import React from "react";

export type ScheduleMode = "simple" | "cron";

export interface JobFormState {
  name: string;
  jobKey: string;
  jobClass: string;
  enabled: boolean;
  cronExpression: string;
  scheduleMode: ScheduleMode;
  days: string[];
  hour: string;
  minute: string;
}

export interface BatchJobPayload {
  name: string;
  jobKey: string;
  jobClass: string;
  cronExpression: string;
  enabled: boolean;
}

interface BatchFormProps {
  title: string;
  form: JobFormState;
  readOnly: boolean;
  saving: boolean;
  onChange: (next: JobFormState) => void;
  onClose: () => void;
  onSubmit: (payload: BatchJobPayload) => Promise<void>;
}

const DAY_OPTIONS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);

export const defaultBatchForm: JobFormState = {
  name: "",
  jobKey: "",
  jobClass: "",
  enabled: true,
  cronExpression: "0 */5 * * * *",
  scheduleMode: "simple",
  days: ["MON", "TUE", "WED", "THU", "FRI"],
  hour: "00",
  minute: "00",
};

export function toFormFromCron(cronExpression: string) {
  const normalized = cronExpression.trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ");
  if (parts.length !== 6) {
    return null;
  }

  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  if (second !== "0" || month !== "*") {
    return null;
  }
  if (!/^\d{1,2}$/.test(minute) || !/^\d{1,2}$/.test(hour)) {
    return null;
  }
  if (!(dayOfMonth === "?" || dayOfMonth === "*")) {
    return null;
  }

  if (dayOfWeek === "*") {
    return {
      days: [...DAY_OPTIONS],
      hour: hour.padStart(2, "0"),
      minute: minute.padStart(2, "0"),
    };
  }

  const days = dayOfWeek.split(",").map((value) => value.toUpperCase());
  if (!days.every((day) => DAY_OPTIONS.includes(day))) {
    return null;
  }

  return {
    days,
    hour: hour.padStart(2, "0"),
    minute: minute.padStart(2, "0"),
  };
}

/**
 * Builds cron expression from selected mode.
 * 선택된 모드(simple/cron) 기준으로 cron 표현식을 생성한다.
 */
export function buildCronExpression(form: JobFormState) {
  if (form.scheduleMode === "cron") {
    const compact = form.cronExpression.trim().replace(/\s+/g, " ");
    const fields = compact.split(" ");
    if (!(fields.length === 5 || fields.length === 6)) {
      throw new Error("cron expression 형식이 잘못되었습니다.");
    }
    return compact;
  }

  if (!/^\d{2}$/.test(form.hour) || !/^\d{2}$/.test(form.minute)) {
    throw new Error("시/분을 선택해 주세요.");
  }
  if (form.days.length === 0) {
    throw new Error("요일을 최소 1개 이상 선택해 주세요.");
  }

  const dayToken =
    form.days.length === DAY_OPTIONS.length ? "*" : form.days.join(",");
  if (dayToken === "*") {
    return `0 ${Number(form.minute)} ${Number(form.hour)} * * *`;
  }
  return `0 ${Number(form.minute)} ${Number(form.hour)} ? * ${dayToken}`;
}

/**
 * Renders and validates the batch job form.
 * 배치 Job 폼을 렌더링하고 저장 전 유효성을 검사한다.
 */
export default function BatchForm({
  title,
  form,
  readOnly,
  saving,
  onChange,
  onClose,
  onSubmit,
}: BatchFormProps) {
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly) {
      return;
    }

    // Validate job class existence input
    // Job 클래스 입력값 존재 여부를 검증한다.
    if (!form.jobClass.trim()) {
      alert("job_class를 입력해 주세요.");
      return;
    }

    // Validate enabled flag value
    // enabled 값이 정상 boolean인지 검증한다.
    if (typeof form.enabled !== "boolean") {
      alert("enabled 값을 확인해 주세요.");
      return;
    }

    let cronExpression = "";
    try {
      // Validate cron expression format
      // cron 표현식 형식을 검증한다.
      cronExpression = buildCronExpression(form);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "cron expression 형식 오류";
      alert(message);
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      jobKey: form.jobKey.trim(),
      jobClass: form.jobClass.trim(),
      cronExpression,
      enabled: form.enabled,
    });
  };

  return (
    <section className="editor-card">
      <div className="page-header">
        <h3>{title}</h3>
        <button className="btn secondary" onClick={onClose} type="button">
          Close
        </button>
      </div>

      <form className="form-grid" onSubmit={(event) => void submit(event)}>
        <label className="field">
          <span>Name</span>
          <input
            disabled={readOnly || saving}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            required
            value={form.name}
          />
        </label>

        <label className="field">
          <span>Job Key</span>
          <input
            disabled={readOnly || saving}
            onChange={(event) => onChange({ ...form, jobKey: event.target.value })}
            required
            value={form.jobKey}
          />
        </label>

        <label className="field">
          <span>Job Class (FQCN)</span>
          <input
            disabled={readOnly || saving}
            onChange={(event) => onChange({ ...form, jobClass: event.target.value })}
            required
            value={form.jobClass}
          />
        </label>

        <label className="field checkbox-row">
          <span>Enabled</span>
          <input
            checked={form.enabled}
            disabled={readOnly || saving}
            onChange={(event) => onChange({ ...form, enabled: event.target.checked })}
            type="checkbox"
          />
        </label>

        <div className="field">
          <span>Schedule</span>
          <div className="tab-group">
            <button
              className={`tab-btn ${form.scheduleMode === "simple" ? "active" : ""}`}
              disabled={readOnly || saving}
              onClick={() => onChange({ ...form, scheduleMode: "simple" })}
              type="button"
            >
              Easy
            </button>
            <button
              className={`tab-btn ${form.scheduleMode === "cron" ? "active" : ""}`}
              disabled={readOnly || saving}
              onClick={() => onChange({ ...form, scheduleMode: "cron" })}
              type="button"
            >
              Cron
            </button>
          </div>
        </div>

        {form.scheduleMode === "simple" ? (
          <div className="field">
            <span>Weekdays</span>
            <div className="day-grid">
              {DAY_OPTIONS.map((day) => (
                <label className="day-item" key={day}>
                  <input
                    checked={form.days.includes(day)}
                    disabled={readOnly || saving}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onChange({ ...form, days: [...form.days, day] });
                        return;
                      }
                      onChange({
                        ...form,
                        days: form.days.filter((value) => value !== day),
                      });
                    }}
                    type="checkbox"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>

            <div className="time-grid">
              <label className="field">
                <span>Hour</span>
                <select
                  disabled={readOnly || saving}
                  onChange={(event) => onChange({ ...form, hour: event.target.value })}
                  value={form.hour}
                >
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Minute</span>
                <select
                  disabled={readOnly || saving}
                  onChange={(event) => onChange({ ...form, minute: event.target.value })}
                  value={form.minute}
                >
                  {MINUTES.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : (
          <label className="field">
            <span>Cron Expression</span>
            <input
              disabled={readOnly || saving}
              onChange={(event) =>
                onChange({ ...form, cronExpression: event.target.value })
              }
              placeholder="0 */5 * * * *"
              required
              value={form.cronExpression}
            />
          </label>
        )}

        {!readOnly && (
          <button className="btn primary" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </form>
    </section>
  );
}

