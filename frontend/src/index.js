import "./App.css";

const API_URL = "http://127.0.0.1:8000";
const priorities = ["High", "Medium", "Low"];

const elements = {
  errorBox: document.querySelector("#errorBox"),
  form: document.querySelector("#requestForm"),
  refreshButton: document.querySelector("#refreshButton"),
  saveButton: document.querySelector("#saveButton"),
  totalRequests: document.querySelector("#totalRequests"),
  openRequests: document.querySelector("#openRequests"),
  highPriority: document.querySelector("#highPriority"),
  requestRows: document.querySelector("#requestRows"),
  issueChart: document.querySelector("#issueChart"),
  priorityStack: document.querySelector("#priorityStack")
};

function label(value) {
  return value ? String(value).trim() : "Unknown";
}

function showError(message) {
  elements.errorBox.textContent = message;
  elements.errorBox.classList.toggle("hidden", !message);
}

function badgeClass(priority) {
  return `badge priority-${label(priority).toLowerCase().replace(/\s+/g, "-")}`;
}

function renderMetrics(requests) {
  elements.totalRequests.textContent = requests.length;
  elements.openRequests.textContent = requests.filter((request) => label(request.status).toLowerCase() === "open").length;
  elements.highPriority.textContent = requests.filter((request) => label(request.priority).toLowerCase() === "high").length;
}

function renderRequests(requests) {
  if (!requests.length) {
    elements.requestRows.innerHTML = `<tr><td colspan="6" class="table-message">No maintenance requests found.</td></tr>`;
    return;
  }

  elements.requestRows.innerHTML = requests
    .map(
      (request, index) => `
        <tr>
          <td>${request.id || index + 1}</td>
          <td>${label(request.issue_type)}</td>
          <td>${label(request.description)}</td>
          <td><span class="${badgeClass(request.priority)}">${label(request.priority)}</span></td>
          <td>${label(request.status)}</td>
          <td>${label(request.date)}</td>
        </tr>
      `
    )
    .join("");
}

function renderAnalytics(analytics) {
  const issueCount = analytics?.issue_count || {};
  const maxCount = Math.max(1, ...Object.values(issueCount));

  if (!Object.keys(issueCount).length) {
    elements.issueChart.innerHTML = `<p class="empty-state">No analytics available yet.</p>`;
  } else {
    elements.issueChart.innerHTML = Object.entries(issueCount)
      .map(
        ([issue, count]) => `
          <div class="chart-row">
            <span>${label(issue)}</span>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
            <strong>${count}</strong>
          </div>
        `
      )
      .join("");
  }

  elements.priorityStack.innerHTML = priorities
    .map((priority) => `<span>${priority}<strong>${analytics?.priority_count?.[priority] || 0}</strong></span>`)
    .join("");
}

async function loadDashboard() {
  showError("");
  elements.refreshButton.disabled = true;

  try {
    const [requestsResponse, analyticsResponse] = await Promise.all([
      fetch(`${API_URL}/requests`),
      fetch(`${API_URL}/analyze`)
    ]);

    if (!requestsResponse.ok) {
      throw new Error("Backend is running, but requests could not be loaded.");
    }

    const requests = await requestsResponse.json();
    const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null;

    renderMetrics(Array.isArray(requests) ? requests : []);
    renderRequests(Array.isArray(requests) ? requests : []);
    renderAnalytics(analytics?.error ? null : analytics);
  } catch (error) {
    showError("Cannot connect to backend. Start FastAPI on http://127.0.0.1:8000, then refresh.");
    renderRequests([]);
    renderAnalytics(null);
  } finally {
    elements.refreshButton.disabled = false;
  }
}

async function createRequest(event) {
  event.preventDefault();
  showError("");
  elements.saveButton.disabled = true;
  elements.saveButton.textContent = "Saving";

  const formData = new FormData(elements.form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Unable to create request.");
    }

    elements.form.reset();
    elements.form.priority.value = "Medium";
    elements.form.status.value = "Open";
    await loadDashboard();
  } catch (error) {
    showError("Request was not saved. Check that the backend terminal is still running.");
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = "Create Request";
  }
}

elements.form.addEventListener("submit", createRequest);
elements.refreshButton.addEventListener("click", loadDashboard);
loadDashboard();
