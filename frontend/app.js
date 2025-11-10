const API = 'http://localhost:5000/api';
let token = null;

// Helper for API requests
async function api(path, opts = {}) {
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, {
    ...opts,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (res.status === 204) return null;
  return res.json();
}

// --- Hide dashboard and controls before login ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".dashboard").style.display = "none";
  document.querySelector(".controls").style.display = "none";
  document.querySelector("table").style.display = "none";
});

// --- LOGIN ---
document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const data = await api("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data.token) {
      token = data.token;
      document.getElementById("user-label").textContent = `Welcome, ${data.username}`;

      // Hide login, show dashboard
      document.getElementById("login-area").style.display = "none";
      document.querySelector(".dashboard").style.display = "flex";
      document.querySelector(".controls").style.display = "block";
      document.querySelector("table").style.display = "table";

      loadCampaigns();
    } else {
      alert("Login failed");
    }
  } catch (e) {
    alert("Login error");
  }
});

// --- ADD CAMPAIGN ---
document.getElementById("campaign-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const campaign_name = document.getElementById("campaign_name").value;
  const client_name = document.getElementById("client_name").value;
  const start_date = document.getElementById("start_date").value;
  const status = document.getElementById("status").value;

  try {
    await api("/campaigns", {
      method: "POST",
      body: JSON.stringify({ campaign_name, client_name, start_date, status }),
    });
    e.target.reset();
    loadCampaigns();
  } catch (err) {
    alert("Error adding campaign");
  }
});

// --- LOAD CAMPAIGNS ---
async function loadCampaigns() {
  const q = document.getElementById("search").value;
  const status = document.getElementById("filter-status").value;
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (status && status !== "All") params.append("status", status);

  try {
    const list = await api("/campaigns?" + params.toString());
    renderTable(list);
    renderDashboard(list);
  } catch (e) {
    console.error("Error loading campaigns", e);
  }
}

// --- RENDER TABLE ---
function renderTable(list) {
  const tbody = document.querySelector("#campaign-table tbody");
  tbody.innerHTML = "";

  list.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.campaign_name}</td>
      <td>${c.client_name}</td>
      <td>${c.start_date}</td>
      <td>
        <select data-id="${c._id}" class="status-select">
          <option ${c.status === "Active" ? "selected" : ""}>Active</option>
          <option ${c.status === "Paused" ? "selected" : ""}>Paused</option>
          <option ${c.status === "Completed" ? "selected" : ""}>Completed</option>
        </select>
      </td>
      <td><button data-id="${c._id}" class="delete-btn">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Update status
  document.querySelectorAll(".status-select").forEach((s) => {
    s.addEventListener("change", async (e) => {
      const id = e.target.getAttribute("data-id");
      const status = e.target.value;
      await api("/campaigns/" + id, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      loadCampaigns();
    });
  });

  // Delete campaign
  document.querySelectorAll(".delete-btn").forEach((b) => {
    b.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Delete this campaign?")) {
        await api("/campaigns/" + id, { method: "DELETE" });
        loadCampaigns();
      }
    });
  });
}

// --- DASHBOARD COUNTS ---
function renderDashboard(list) {
  document.getElementById("total-count").textContent = list.length;
  document.getElementById("active-count").textContent = list.filter((c) => c.status === "Active").length;
  document.getElementById("paused-count").textContent = list.filter((c) => c.status === "Paused").length;
  document.getElementById("completed-count").textContent = list.filter((c) => c.status === "Completed").length;
}

// --- FILTERS ---
document.getElementById("refresh").addEventListener("click", (e) => {
  e.preventDefault();
  loadCampaigns();
});
document.getElementById("search").addEventListener("input", loadCampaigns);
document.getElementById("filter-status").addEventListener("change", loadCampaigns);
