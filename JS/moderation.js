let currentPage = 1;
let currentStatus = "open";

async function loadReports(status = "open", page = 1) {
  currentStatus = status;
  currentPage = page;

  const type = document.getElementById("filter-type").value;

  const res = await fetch(`/api/team/reports?status=${status}&page=${page}&limit=20&type=${type}`);
  const data = await res.json();

  renderReportList(data.reports, data.page);
}

function reloadReports() {
  loadReports(currentStatus, currentPage);
}

function renderReportList(reports, page) {
  const container = document.getElementById("report-list");
  container.innerHTML = "";

  if (reports.length === 0) {
    container.innerHTML = "<p>No reports found.</p>";
    return;
  }

  reports.forEach(r => {
    const div = document.createElement("div");
    div.className = "report-row";
    div.innerHTML = `
          <div>
            <b>#${r.id}</b> — <span class="type">${r.type}</span>
            <span class="reason">${r.reason}</span>
            <span class="reporter">Reported by @${r.reporter_username}</span>
          </div>
          <button onclick="openReport(${r.id})">Open</button>
        `;
    container.appendChild(div);
  });

  container.innerHTML += `
      <div class="pagination">
        <button onclick="loadReports('${currentStatus}', ${page - 1})" ${page <= 1 ? "disabled" : ""}>Prev</button>
        <span>Page ${page}</span>
        <button onclick="loadReports('${currentStatus}', ${page + 1})">Next</button>
      </div>
    `;
}

async function openReport(id) {
  const res = await fetch(`/api/team/reports/${id}/`);
  const data = await res.json();
  renderReportDetail(data);
}

function renderReportDetail(data) {
  const container = document.getElementById("report-detail");
  const { report, snapshot, versions } = data;

  container.innerHTML = `
      <h2>Report #${report.id}</h2>
      <p><b>Type:</b> ${report.type}</p>
      <p><b>Reporter:</b> @${report.reporter_username}</p>
      <p><b>Reason:</b> ${report.reason}</p>
      <p><b>Details:</b> ${report.details || "None"}</p>

      <h3>Snapshot</h3>
      <div id="admin-report-review-box">${renderReportViewer(report.type, snapshot, report.id, report.reporter_username)}</div>

      ${data.hasBlob ? `<img height="500px" src="/api/team/reports/${report.id}/blob" class="snapshot-img">` : ""}

      <h3>Version History</h3>
      ${versions.map(v => `
        <div class="version-entry">
          <b>${v.change_type}</b> by user #${v.editor_id} at ${v.created_at}
          <pre>Old: ${v.old_value}</pre>
          <pre>New: ${v.new_value}</pre>
        </div>
      `).join("")}

      <h3>Actions</h3>
      <button onclick="setReportStatus(${report.id}, 'reviewed')">Mark Reviewed</button>
      <button onclick="setReportStatus(${report.id}, 'dismissed')">Dismiss</button>
      <button onclick="setReportStatus(${report.id}, 'action_taken')">Action Taken</button>
      <h4>Need to ban a user?</h4>
      <p>Leave a note</p>
      <textarea id="moderator-note"></textarea>
    `;
}

function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  if (years < 100) return `${years} year${years !== 1 ? "s" : ""} ago`;
  const centuries = Math.floor(years / 100);
  if (centuries < 100) return `${centuries} centur${centuries !== 1 ? "ies" : "y"} ago`;

  // Fallback: show exact date/time
  return `on ${then.toLocaleDateString()} at ${then.toLocaleTimeString()}`;
}

function renderReportViewer(type, snapshot, id, reporter_username) {
  const types = ["comment", "project", "message", "user"];
  if (!types.includes(type)) {
    return `
        <h3>Invalid report type!</h3>
        `;
  } else {
    switch (type) {
      case "comment":
        {
          const c = snapshot;
          console.log(c);
          return `
            <hr style="width: 747px">
            <div style="flex-direction: row; display: flex; column-gap: 10px;">
            <div>
              <a href="/users/${c.username}/">
                <img src="/users/${c.username}/pfp/" width="50px" height="50px"
                    style="background-color: white; border: rgb(200, 200, 200) 2px solid;">
              </a>
            </div>
            <div style="display: block;">
              <div>
                <a href="/users/${c.username}/">
                  <h4 style="margin-top: 0px;">${c.username}</h4>
                </a>
                <span style="font-size: 12px; color: gray;" title="${new Date(c.timestamp).toLocaleString()}">
                    ${timeAgo(c.timestamp)}
                </span>

              </div>
              <div style="word-break: break-all;">${c.message}</div>
            </div>
            <!--<hr style="width: 250px">-->
              <ul style="float: right; display: flex; position: absolute; right: 12vw;">
              <button class="report" onclick="banUser('${c.username}');">Ban user</button> <button onclick="deleteComment(${c.id});">Delete</button>
              </ul>
          </div>
          <hr style="width: 747px">
            `;
        }
      case "project":
        return `
        <iframe src="/api/reported/viewer/?id=${id}" data="/api/reported/viewer/?id=${id}" type="text/html" style="zoom:0.5;" width="1000" height="500" allowfullscreen="true" fullscreen></iframe>
        `;
      case "message":
        {
          console.log(snapshot);

          let html = ``;

          const r = snapshot.reportedMessage;
          const sender = JSON.parse(r.sender);

          const c = snapshot.contextMessages;

          if (c.length > 0) {
            c.forEach((m) => {
              console.log(m);
              html += `<div id="intro" class="info-box">
              </div>
              `;
            });
          }

          html += `
          <div id="intro" class="info-box" style="background-color: red;">
          <h1>Reported Message</h1>
          <ul>
            <li>Sent by: ${sender.user.username} as "${sender.nickname}"</li>
            <li>Received by: ${reporter_username}</li>
            <h3>${r.title}</h3>
            <p>${r.content}</p>
          </ul>
          </div>
          `;

          return html;
        }
      default:
        return `<h3>Invalid report type!</h3>`;
    }
  }
}

async function setReportStatus(id, status) {
  await fetch(`/api/team/reports/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  reloadReports();
}

function banUser(username) {
  if (confirm(`Ban ${username}?`)) {
    document.getElementById("moderator-note").value;
    serverBanUser(username, document.getElementById("moderator-note").value, 5);
  }
}

async function serverBanUser(username, note, sentence) {
  const body = JSON.stringify({
    modNote: note,
    sentence
  });
  const response = await fetch(`/api/team/ban/${username}/`, { body, method: "POST" });
  const json = await response.json();
  alert(json.status);
}