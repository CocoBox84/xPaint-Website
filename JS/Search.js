// Search.js

function switchTab(tab, type = "type") {
  const url = new URL(window.location.href);
  url.searchParams.set(type, tab);
  window.location.href = url.toString();
}

async function runSearch() {
  const url = new URL(window.location.href);
  const params = url.searchParams.toString();

  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) return;

  const { results } = await res.json();
  const container = document.getElementById("search-results");
  container.innerHTML = ""; // clear old results

  const at = new Amp();

  console.log(results); // Debugging line to check the structure of results

  results.forEach(r => {
    const box = document.createElement("div");
    box.className = "box-product result";

    // --- PROJECT RESULT ---
    if (r.type === "project") {
      box.innerHTML = `
        <img src="${r.thumbnailUrl}" alt="Thumbnail" width="170" height="170">
        <div>
          <h3>${at.Stickerify(at.linkify(r.name))}</h3>
          <p>By <a href="/users/${r.owner.username}/">${r.owner.username}</a></p>
          <p class="p-description">${at.Stickerify(at.linkify(r.description || ""))}</p>
          <a href="/projects/${r.id}/">View Project</a>
        </div>
      `;
    }

    // --- USER / ADMIN RESULT ---
    else if (r.type === "user" || r.type === "admin") {
      box.innerHTML = `
        <img src="${r.pfpUrl}" alt="Profile Picture" width="170" height="170">
        <div>
          <h1><a href="/users/${r.username}/">${r.username}</a></h1>
          <p class="p-description">${at.Stickerify(at.linkify(r.description || ""))}</p>
        </div>
      `;
    }

    // --- BOARD (future) ---
    else if (r.type === "board") {
      box.innerHTML = `
        <div>
          <h3>Board</h3>
          <p>Boards are not implemented yet.</p>
        </div>
      `;
    }

    container.appendChild(box);
  });
}

document.addEventListener("DOMContentLoaded", runSearch);