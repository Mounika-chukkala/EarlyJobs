const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function downloadUrl(path) {
  window.open(`${API_BASE}${path}`, "_blank");
}

export const api = {
  getMetrics: () => request("/api/dashboard/metrics"),
  getStages: () => request("/api/stages"),
  getCandidates: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value)
    ).toString();
    return request(`/api/candidates${query ? `?${query}` : ""}`);
  },
  getCandidate: (id) => request(`/api/candidates/${id}`),
  createCandidate: (body) =>
    request("/api/candidates", { method: "POST", body: JSON.stringify(body) }),
  updateCandidate: (id, body) =>
    request(`/api/candidates/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updateStage: (id, stage) =>
    request(`/api/candidates/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),
  addNote: (id, text) =>
    request(`/api/candidates/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  deleteCandidate: (id) =>
    request(`/api/candidates/${id}`, { method: "DELETE" }),
  importExcel: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/api/candidates/import/excel", {
      method: "POST",
      body: form,
    });
  },
  downloadTemplate: () => downloadUrl("/api/candidates/import/template"),
  exportExcel: () => downloadUrl("/api/candidates/export/excel"),
  getJobs: () => request("/api/jobs"),
  createJob: (body) =>
    request("/api/jobs", { method: "POST", body: JSON.stringify(body) }),
  updateJob: (id, body) =>
    request(`/api/jobs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteJob: (id) => request(`/api/jobs/${id}`, { method: "DELETE" }),
};
