let projectid = new URLSearchParams(window.location.search).get("id");
function loadid() {
    return projectid = new URLSearchParams(window.location.search).get("id");
}

const host = (false) ? "www.cocoink.ink" : "127.0.0.1:5500";

async function loadProjectJSON(id) {
    const res = await fetch(`//${host}/f/xPaint/api/load/projects/${id}/`, { method: "GET" });
    const json = await res.json();
    console.log(res, json, id);
    if (!json?.status) {
        return null;
    }
}

loadProjectJSON(loadid());