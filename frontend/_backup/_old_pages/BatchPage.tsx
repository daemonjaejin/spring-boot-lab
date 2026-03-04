import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";
import BatchForm, {
  BatchJobPayload,
  defaultBatchForm,
  JobFormState,
  toFormFromCron,
} from "../components/BatchForm";

type ViewState = "loading" | "success" | "empty" | "error";
type EditorMode = "create" | "edit" | "detail";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BatchJob {
  id: number;
  name: string;
  jobKey: string;
  jobClass: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt: string | null;
}

interface BatchExecution {
  executionId: number;
  batchJobId: number | null;
  jobName: string;
  status: string;
  exitCode: string | null;
  createTime: string | null;
  startTime: string | null;
  endTime: string | null;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function buildForm(job: BatchJob): JobFormState {
  const simple = toFormFromCron(job.cronExpression);
  if (!simple) {
    return {
      ...defaultBatchForm,
      name: job.name,
      jobKey: job.jobKey,
      jobClass: job.jobClass,
      enabled: job.enabled,
      scheduleMode: "cron",
      cronExpression: job.cronExpression,
    };
  }
  return {
    ...defaultBatchForm,
    name: job.name,
    jobKey: job.jobKey,
    jobClass: job.jobClass,
    enabled: job.enabled,
    scheduleMode: "simple",
    days: simple.days,
    hour: simple.hour,
    minute: simple.minute,
  };
}

function extractApiError(error: unknown) {
  const anyError = error as {
    response?: { status?: number; data?: unknown };
    message?: string;
  };
  const status = anyError?.response?.status;
  const payload = anyError?.response?.data;

  if (status === 403) {
    return { status, message: "권한이 없습니다" };
  }
  if (status === 500) {
    return { status, message: "서버 오류 발생" };
  }
  if (payload && typeof payload === "object" && "message" in payload) {
    return { status, message: String((payload as { message: unknown }).message) };
  }
  if (typeof payload === "string" && payload) {
    return { status, message: payload };
  }
  return { status, message: anyError?.message || "요청 처리 중 오류가 발생했습니다." };
}

/**
 * Batch management page with CRUD/run/error alerts.
 * 배치 관리 CRUD/실행/오류 알림을 담당하는 페이지.
 */
export default function BatchPage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const [jobsState, setJobsState] = useState<ViewState>("loading");
  const [jobsError, setJobsError] = useState("");
  const [jobs, setJobs] = useState<BatchJob[]>([]);

  const [executionsState, setExecutionsState] = useState<ViewState>("loading");
  const [executionsError, setExecutionsError] = useState("");
  const [executions, setExecutions] = useState<BatchExecution[]>([]);

  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [form, setForm] = useState<JobFormState>(defaultBatchForm);
  const [saving, setSaving] = useState(false);
  const [runningJobId, setRunningJobId] = useState<number | null>(null);

  /**
   * Loads batch job list from backend.
   * 백엔드에서 배치 작업 목록을 조회한다.
   */
  const loadJobs = async () => {
    setJobsState("loading");
    setJobsError("");
    try {
      const response = await client.get<ApiResponse<BatchJob[]>>("/batch/jobs");
      if (!response.data.success) {
        throw new Error(response.data.message || "목록 조회 실패");
      }
      const rows = response.data.data || [];
      setJobs(rows);
      setJobsState(rows.length === 0 ? "empty" : "success");
    } catch (error) {
      const { message } = extractApiError(error);
      setJobsError(message);
      setJobsState("error");
    }
  };

  /**
   * Loads execution history from backend.
   * 백엔드에서 실행 이력을 조회한다.
   */
  const loadExecutions = async () => {
    setExecutionsState("loading");
    setExecutionsError("");
    try {
      const response = await client.get<ApiResponse<BatchExecution[]>>(
        "/batch/executions"
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "이력 조회 실패");
      }
      const rows = response.data.data || [];
      setExecutions(rows);
      setExecutionsState(rows.length === 0 ? "empty" : "success");
    } catch (error) {
      const { message } = extractApiError(error);
      setExecutionsError(message);
      setExecutionsState("error");
    }
  };

  useEffect(() => {
    void loadJobs();
    void loadExecutions();
  }, []);

  const openCreate = () => {
    if (!isAdmin) {
      return;
    }
    setEditorMode("create");
    setSelectedJobId(null);
    setForm(defaultBatchForm);
  };

  const openDetail = async (jobId: number) => {
    try {
      const response = await client.get<ApiResponse<BatchJob>>(`/batch/jobs/${jobId}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      setEditorMode("detail");
      setSelectedJobId(jobId);
      setForm(buildForm(response.data.data));
    } catch (error) {
      const { message } = extractApiError(error);
      alert("오류: " + message);
    }
  };

  const openEdit = async (jobId: number) => {
    if (!isAdmin) {
      return;
    }
    try {
      const response = await client.get<ApiResponse<BatchJob>>(`/batch/jobs/${jobId}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      setEditorMode("edit");
      setSelectedJobId(jobId);
      setForm(buildForm(response.data.data));
    } catch (error) {
      const { message } = extractApiError(error);
      alert("오류: " + message);
    }
  };

  const closeEditor = () => {
    setEditorMode(null);
    setSelectedJobId(null);
    setForm(defaultBatchForm);
  };

  /**
   * Handles create/update API call and shows alert messages.
   * 생성/수정 API 호출 후 결과 알림(alert)을 표시한다.
   */
  const saveJob = async (payload: BatchJobPayload) => {
    if (!isAdmin || !editorMode || editorMode === "detail") {
      return;
    }

    setSaving(true);
    try {
      if (editorMode === "create") {
        const response = await client.post<ApiResponse<BatchJob>>("/batch/jobs", payload);
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
        alert("등록되었습니다.");
      } else if (selectedJobId) {
        const response = await client.put<ApiResponse<BatchJob>>(
          `/batch/jobs/${selectedJobId}`,
          payload
        );
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
        alert("수정되었습니다.");
      }
      await loadJobs();
      await loadExecutions();
      if (editorMode === "create") {
        setForm(defaultBatchForm);
      }
    } catch (error) {
      const { message } = extractApiError(error);
      alert("오류: " + message);
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (job: BatchJob) => {
    if (!isAdmin) {
      return;
    }
    try {
      const response = await client.delete<ApiResponse<null>>(`/batch/jobs/${job.id}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      alert("삭제되었습니다.");
      if (selectedJobId === job.id) {
        closeEditor();
      }
      await loadJobs();
      await loadExecutions();
    } catch (error) {
      const { message } = extractApiError(error);
      alert("오류: " + message);
    }
  };

  const runJobNow = async (job: BatchJob) => {
    if (!isAdmin) {
      return;
    }
    setRunningJobId(job.id);
    try {
      const response = await client.post<ApiResponse<{ executionId: number }>>(
        `/batch/jobs/${job.id}/run`
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      alert("실행되었습니다.");
      await loadJobs();
      await loadExecutions();
    } catch (error) {
      const { message } = extractApiError(error);
      alert("오류: " + message);
    } finally {
      setRunningJobId(null);
    }
  };

  const selectedTitle = useMemo(() => {
    if (editorMode === "create") {
      return "Register Job";
    }
    if (editorMode === "edit") {
      return "Edit Job";
    }
    if (editorMode === "detail") {
      return "Job Detail";
    }
    return "";
  }, [editorMode]);

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Batch Jobs</h2>
        {isAdmin ? (
          <button className="btn primary" onClick={openCreate} type="button">
            Register Job
          </button>
        ) : (
          <span className="muted">View only</span>
        )}
      </div>

      <h3>Job Definitions</h3>
      {jobsState === "loading" && <p className="state-loading">Loading...</p>}
      {jobsState === "empty" && <p className="state-empty">No data</p>}
      {jobsState === "error" && (
        <div className="state-error-box">
          <p className="state-error">{jobsError}</p>
          <button className="btn secondary" onClick={() => void loadJobs()} type="button">
            Retry
          </button>
        </div>
      )}
      {jobsState === "success" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Job Key</th>
                <th>Job Class</th>
                <th>Cron</th>
                <th>Enabled</th>
                <th>Last Run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.name}</td>
                  <td>{job.jobKey}</td>
                  <td>{job.jobClass}</td>
                  <td>{job.cronExpression}</td>
                  <td>{job.enabled ? "Y" : "N"}</td>
                  <td>{formatDateTime(job.lastRunAt)}</td>
                  <td>
                    <div className="action-group">
                      <button
                        className="btn secondary small"
                        onClick={() => void openDetail(job.id)}
                        type="button"
                      >
                        Detail
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="btn secondary small"
                            onClick={() => void openEdit(job.id)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="btn primary small"
                            disabled={runningJobId === job.id}
                            onClick={() => void runJobNow(job)}
                            type="button"
                          >
                            {runningJobId === job.id ? "Running..." : "Run"}
                          </button>
                          <button
                            className="btn danger small"
                            onClick={() => void deleteJob(job)}
                            type="button"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editorMode && (
        <BatchForm
          form={form}
          onChange={setForm}
          onClose={closeEditor}
          onSubmit={saveJob}
          readOnly={!isAdmin || editorMode === "detail"}
          saving={saving}
          title={selectedTitle}
        />
      )}

      <h3>Execution History</h3>
      {executionsState === "loading" && <p className="state-loading">Loading...</p>}
      {executionsState === "empty" && <p className="state-empty">No data</p>}
      {executionsState === "error" && (
        <div className="state-error-box">
          <p className="state-error">{executionsError}</p>
          <button
            className="btn secondary"
            onClick={() => void loadExecutions()}
            type="button"
          >
            Retry
          </button>
        </div>
      )}
      {executionsState === "success" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Job Name</th>
                <th>Status</th>
                <th>Exit</th>
                <th>Created</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((execution) => (
                <tr key={`${execution.executionId}-${execution.jobName}`}>
                  <td>{execution.executionId}</td>
                  <td>{execution.jobName}</td>
                  <td>{execution.status}</td>
                  <td>{execution.exitCode || "-"}</td>
                  <td>{formatDateTime(execution.createTime)}</td>
                  <td>{formatDateTime(execution.startTime)}</td>
                  <td>{formatDateTime(execution.endTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

