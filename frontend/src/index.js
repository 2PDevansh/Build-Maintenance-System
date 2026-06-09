import "./App.css";

const API_URL = "http://127.0.0.1:8000";
const priorities = ["High", "Medium", "Low"];
const chartColors = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626", "#0891b2"];

const state = {
  requests: [],
  analytics: null,
  search: "",
  priority: "All"
};

const el = {
  errorBox: document.querySelector("#errorBox"),
  refreshButton: document.querySelector("#refreshButton"),
  form: document.querySelector("#requestForm"),
  saveButton: document.querySelector("#saveButton"),
  totalRequests: document.querySelector("#totalRequests"),
  openRequests: document.querySelector("#openRequests"),
  highPriority: document.querySelector("#highPriority"),
  hdfsStatus: document.querySelector("#hdfsStatus"),
  hdfsNodes: document.querySelector("#hdfsNodes"),
  hdfsStorage: document.querySelector("#hdfsStorage"),
  issuePieChart: document.querySelector("#issuePieChart"),
  priorityBarChart: document.querySelector("#priorityBarChart"),
  requestRows: document.querySelector("#requestRows"),
  searchInput: document.querySelector("#searchInput"),
  priorityFilter: document.querySelector("#priorityFilter")
};

function label(value) {
  return value ? String(value).trim() : "Unknown";
}

function showError(message) {
  el.errorBox.textContent = message;
  el.errorBox.classList.toggle("hidden", !message);
}

function rowsFromCounts(counts = {}) {
  const total = Object.values(counts).reduce((sum, value) => sum + Number(value), 0);
  return Object.entries(counts).map(([name, value], index) => ({
    name,
    value: Number(value),
    percent: total ? Math.round((Number(value) / total) * 100) : 0,
    color: chartColors[index % chartColors.length]
  }));
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function renderPieChart(rows) {
  if (!rows.length) {
    el.issuePieChart.innerHTML = `<p class="empty-state">No analytics available yet.</p>`;
    return;
  }

  let angle = 0;
  const slices = rows
    .map((row) => {
      const nextAngle = angle + row.percent * 3.6;
      const path = describeArc(110, 110, 92, angle, nextAngle || 360);
      angle = nextAngle;
      return `<path d="${path}" fill="${row.color}"><title>${row.name}: ${row.percent}%</title></path>`;
    })
    .join("");

  const legend = rows
    .map(
      (row) => `
        <div class="chart-legend-row">
          <span style="background:${row.color}"></span>
          <strong>${row.name}</strong>
          <em>${row.percent}%</em>
        </div>`
    )
    .join("");

  el.issuePieChart.innerHTML = `
    <div class="svg-chart-layout">
      <svg class="pie-svg" viewBox="0 0 220 220" role="img" aria-label="Issue type pie chart">${slices}</svg>
      <div class="chart-legend">${legend}</div>
    </div>`;
}

function renderBarChart(rows) {
  const maxValue = Math.max(1, ...rows.map((row) => row.value));
  el.priorityBarChart.innerHTML = `
    <div class="bar-chart">
      ${rows
        .map(
          (row) => `
            <div class="bar-item">
              <div class="bar-label"><span>${row.name}</span><strong>${row.value}</strong></div>
              <div class="bar-track"><div class="bar-fill" style="width:${(row.value / maxValue) * 100}%"></div></div>
            </div>`
        )
        .join("")}
    </div>`;
}

function renderMetrics() {
  el.totalRequests.textContent = state.requests.length;
  el.openRequests.textContent = state.requests.filter((request) => label(request.status).toLowerCase() === "open").length;
  el.highPriority.textContent = state.requests.filter((request) => label(request.priority).toLowerCase() === "high").length;
}

function renderRequests() {
  const filtered = state.requests.filter((request) => {
    const searchable = `${request.issue_type} ${request.description}`.toLowerCase();
    const matchesSearch = searchable.includes(state.search.toLowerCase());
    const matchesPriority = state.priority === "All" || label(request.priority) === state.priority;
    return matchesSearch && matchesPriority;
  });

  if (!filtered.length) {
    el.requestRows.innerHTML = `<tr><td colspan="7" class="table-message">No matching maintenance requests found.</td></tr>`;
    return;
  }

  el.requestRows.innerHTML = filtered
    .map(
      (request) => `
        <tr>
          <td>${request.id}</td>
          <td>${label(request.issue_type)}</td>
          <td>${label(request.description)}</td>
          <td><span class="badge priority-${label(request.priority).toLowerCase()}">${label(request.priority)}</span></td>
          <td><span class="status-pill status-${label(request.status).toLowerCase().replace(/\s+/g, "-")}">${label(request.status)}</span></td>
          <td>${label(request.date)}</td>
          <td>
            <div class="action-row">
              <button type="button" data-action="close" data-id="${request.id}" ${label(request.status) === "Closed" ? "disabled" : ""}>Close</button>
              <button class="danger-button" type="button" data-action="delete" data-id="${request.id}">Delete</button>
            </div>
          </td>
        </tr>`
    )
    .join("");
}

function renderDashboard() {
  renderMetrics();
  renderRequests();
  renderPieChart(rowsFromCounts(state.analytics?.issue_count));
  renderBarChart(priorities.map((name) => ({ name, value: Number(state.analytics?.priority_count?.[name] || 0) })));
}

async function loadDashboard() {
  showError("");
  el.refreshButton.disabled = true;

  try {
    const [requestsResponse, analyticsResponse, hdfsResponse] = await Promise.all([
      fetch(`${API_URL}/requests`),
      fetch(`${API_URL}/analyze`),
      fetch(`${API_URL}/hdfs/status`)
    ]);

    if (!requestsResponse.ok) {
      throw new Error("Unable to load requests.");
    }

    state.requests = await requestsResponse.json();
    const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null;
    const hdfs = hdfsResponse.ok ? await hdfsResponse.json() : null;

    state.analytics = analytics?.error ? null : analytics;
    el.hdfsStatus.textContent = hdfs?.status || "Offline";
    el.hdfsNodes.textContent = `Live Nodes: ${hdfs?.live_nodes ?? 0}`;
    el.hdfsStorage.textContent = `Storage Used: ${hdfs?.storage_used_mb ?? 0} MB`;
    renderDashboard();
  } catch (error) {
    showError("Cannot connect to backend. Start FastAPI on http://127.0.0.1:8000, then refresh.");
    state.requests = [];
    state.analytics = null;
    renderDashboard();
  } finally {
    el.refreshButton.disabled = false;
  }
}

async function createRequest(event) {
  event.preventDefault();
  showError("");
  el.saveButton.disabled = true;
  el.saveButton.textContent = "Saving";

  const payload = Object.fromEntries(new FormData(el.form).entries());

  try {
    const response = await fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Unable to create request.");
    }

    el.form.reset();
    el.form.priority.value = "Medium";
    el.form.status.value = "Open";
    await loadDashboard();
  } catch (error) {
    showError("Request was not saved. Check that the backend terminal is still running.");
  } finally {
    el.saveButton.disabled = false;
    el.saveButton.textContent = "Create Request";
  }
}

async function runAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  const url = action === "close" ? `${API_URL}/requests/${id}/close` : `${API_URL}/requests/${id}`;
  const method = action === "close" ? "PATCH" : "DELETE";

  await fetch(url, { method });
  await loadDashboard();
}

el.form.addEventListener("submit", createRequest);
el.refreshButton.addEventListener("click", loadDashboard);
el.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderRequests();
});
el.priorityFilter.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-priority]");
  if (!button) return;
  state.priority = button.dataset.priority;
  el.priorityFilter.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  renderRequests();
});
el.requestRows.addEventListener("click", runAction);

renderDashboard();
loadDashboard();
