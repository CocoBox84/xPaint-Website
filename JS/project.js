console.log("Project.js Started!");

class Project {
    constructor(metadata) {
        var method = metadata => {
            try {
                return JSON.parse(metadata);
            } catch (err) {
                return metadata;
            }
        };
        this.info = method(metadata);
    }
}

function projectType(metadata) {
    return metadata["type"];
}

function getProjectId() {
    const href = window.location.href;

    const segments = new URL(href).pathname.split('/');
    const last = segments.pop() || segments.pop(); // Handle potential trailing slash
    console.log(last);
    return Number(last);
}

let project = new Project("", "");
const pid = getProjectId();

async function getProject() {
    console.log(pid);
    // 0 is another way for false, so check that it's not a 0;
    if (!pid && (pid !== 0)) return 400;
    return await fetch(`/api/projects/${pid}/`, {
        headers: {
            type: "GET"
        }
    }).then(res => {
        if (!res.ok) {
            return res.status;
        }
        const jsonRes = res.json();
        return jsonRes;
    }).then(data => {
        console.log(data);
        return data;
    });
}

async function loadProjectAndDisplay() {
    project = await getProject();
    let fileReq = null;
    try {
        fileReq = await fetch(`/api/projects/${getProjectId()}/script`);
    } catch (error) { }
    const file = (await fileReq.blob().then(blob => blob.text())).toString();
    document.getElementById("project-container").innerHTML = "";
    if (typeof project === "number") {
        document.getElementById("project-container").innerHTML = `
    <div id="project-load-error" style="display: flex; flex-direction: column; justify-self: center; align-self: center;">
    </div>
    `;
        let cause = "";
        switch (project) {
            case 400:
                cause = "Malformed URL!";
                break;
            case 404:
                cause = "Project does not exist!";
                break;
            case 401:
                cause = "Unshared Project!";
                break;
            case 423:
                cause = "Sorry! I know it's your project as well. <br> But the owner has made their account private!"
                break;
            case 500:
                cause = "Server Error! Server could have crashed, or ran out of memory! <br> Or It could have thrown an exception (error) while trying to load your project!";
                break;
            default:
                cause = "Unknown Error!";
                break;
        }

        window.document.getElementById("project-load-error").innerHTML = `
    <img src="/Stickers/X.stikr" alt="X" height="50px" style="font-size: 50px; justify-self: center; align-self: center;">
    <h2 style="justify-self: center; align-self: center;">Project Cannot Display!</h2>
    <h3 style="justify-self: center; align-self: center;">${cause}</h3>
    `;

    } else {
        project = new Project(project.filedata.metadata);
        console.log(project.info);
        setTitle(project.info["project-name"]);
        const applyItems = (project = new Project(project.filedata.metadata)) => {
            try {
                const items = ["project-description", "project-name", "project-description"];
                items.forEach(item => {
                    try {
                        document.getElementById(item).innerHTML = project.info[item];
                    } catch (err) {
                        console.log(`Failed to set "${item}". Error: ${err}`);
                    }
                });

                let creators = project.info["creators"].map(user => "@" + user.username).join(" ");
                document.getElementById("project-creators").innerHTML = "Created by:" + creators;
                document.getElementById("project-owner").innerHTML = "Owned by: @" + project.info.owner.username;
                document.getElementById("project-type").innerHTML = `<a href="/search/?type=project&project_type=${project.info.type}"><img class="sticker" src="/Project Types/${project.info.type}.png"> ${project.info.type}</a>`;

                if (username && (username === project.info.owner.username)) {
                    document.getElementById("project-name-edit").value = document.getElementById("project-name").innerHTML;
                    const input = document.getElementById("project-name-edit");
                    document.getElementById("project-name").addEventListener("mouseover", () => {
                        document.getElementById("project-name").classList.add("hide");
                        document.getElementById("project-name-edit").classList.remove("hide");
                    });
                    document.getElementById("project-name-edit").addEventListener("mouseleave", () => {
                        document.getElementById("project-name").classList.remove("hide");
                        document.getElementById("project-name-edit").classList.add("hide");
                    });
                    input.addEventListener("blur", () => {
                        document.getElementById("project-name").innerHTML = input.value;
                        addDetails();
                        updateTitle(input.value);
                    });
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') input.blur();
                    });
                }

                if (username && (username === project.info.owner.username)) {
                    const desc = document.getElementById("project-description");
                    const descEdit = document.getElementById("project-description-edit");
                    if (project.info.isShared) {
                        document.getElementById("share-project-confirm").classList.add("hide");
                        document.getElementById("unshare-project-confirm").classList.add("hide");
                        document.getElementById("share-button").classList.add("hide");
                        document.getElementById("unshare-button").classList.remove("hide");
                    }

                    descEdit.value = desc.innerHTML;

                    desc.addEventListener("mouseover", () => {
                        desc.classList.add("hide");
                        descEdit.classList.remove("hide");
                    });

                    descEdit.addEventListener("mouseleave", () => {
                        desc.classList.remove("hide");
                        descEdit.classList.add("hide");
                    });

                    descEdit.addEventListener("blur", () => {
                        desc.innerHTML = descEdit.value;
                        updateDescription(descEdit.value);
                    });
                }
            } catch { }

            const container = document.getElementById("project-container");

            if (!file) {
                container.innerHTML = "<p>No file uploaded for this project yet.</p>";
            } else if (project.info.type === "Video") {
                const mime = project.info.fileInfo?.type || "video/mp4";
                container.innerHTML = `
<video
    id="video-player"
    class="video-js"
    controls
    preload="auto"
    width="765"
    height="350"
    style="background-color: black;"
    poster="/api/projects/${getProjectId()}/thumbnail"
    data-setup='{"controls": true, "preload": "auto"}'
  >
    <source src="/api/projects/${getProjectId()}/video" type="${mime}" />
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a
      web browser that
      <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
</video>
        `;
                VideoJSInitPlayer("video-player");
                recordView(); // Add a view on display.
            } else if (project.info.type === "Picture") {
                const mime = project.info.fileInfo?.type || "image/png";
                container.innerHTML = `<img src="/api/projects/${getProjectId()}/image" alt="Project Image" style="width: 100%; height: 100%;" type="${mime}">`;
                recordView(); // Add a view on display.
            } else if (project.info.type === "CocoScript") {
                if (!file || file.length === 0) {
                    container.innerHTML = `<div><h1>Project can't display!</h1><h2>No CocoScript file found!</h2></div>`;
                    return;
                }
                container.innerHTML = `
<h1 id="click-to-play" style="background-color: white; width: 100%; height: 100%; justify-content: center; align-items: center; display: flex; cursor: pointer;">Click to play!</h1>
<canvas id="stage" class="hide" width="765px" height="350px" style="background-color: white; position: relative;"></canvas>
        `;
                function playProject() {
                    lowerMusic(true);
                    document.getElementById("stage").removeEventListener("click", playProject);
                    document.getElementById("click-to-play").removeEventListener("click", playProject);
                    document.getElementById("click-to-play").remove();
                    document.getElementById("stage").classList.remove("hide");
                    console.log("Playing CocoScript Project...");
                    console.log(file);
                    const CocoScript = new CocoScriptEngine();
                    recordView(); // Add a view on play.
                    // "Diplay" is important, stop touching it! And yes, it's spelled that way.
                    const diplay = window.diplay; // "Diplay" is important, stop touching it!
                    const SXMLRuntime = new SXMLParser(diplay.Stage).parse(file);
                }
                document.getElementById("stage").addEventListener("click", playProject);
                document.getElementById("click-to-play").addEventListener("click", playProject);
            } else if (project.info.type === "Audio") {
                container.style.backgroundImage = `url("/api/projects/${getProjectId()}/thumbnail/")`;
                container.style.backgroundRepeat = "no-repeat";
                container.style.backgroundSize = "100% 100%";
                container.innerHTML = `
                <div style="width: 50%;">
                    <div id="audio-player" style="width: 100%;">
                        <audio id="audio" preload="metadata">
                            <source src="/api/projects/${getProjectId()}/audio/" type="${project.info.fileInfo.type}">
                        </audio>
                        <div style="width: 100%;"><input id="seekSlider" type="range" value="0"></div> <button id="playPauseBtn">Start</button> <span id="timeDisplay"></span>
                    </div>
                </div
                `;
                prepareAudioPlayer();
            } else {
                container.innerHTML = `<div><h1>Project can't display!</h1><h2>Invalid Project Type! "${project.info.type}"</h2></div>`;
            }

            function addDetails() {
                const list = ["project-name", "project-description", "project-owner", "project-creators"];
                list.forEach(item => {
                    window.document.getElementById(item).innerHTML = removeAllTagsAndContentDOM(window.document.getElementById(item).innerHTML);
                    window.document.getElementById(item).innerHTML = new Amp().linkify(window.document.getElementById(item).innerHTML);
                    window.document.getElementById(item).innerHTML = new Amp().Stickerify(window.document.getElementById(item).innerHTML);
                });
            }
            try {
                addSharingOptions();
                addDetails();
                loadComments();
                loadStats();
            } catch { }
        };

        applyItems(project);
    }
}

async function recordView() {
    const pid = getProjectId();
    await fetch(`/api/projects/${pid}/view`, { method: "POST" });
    loadStats();
}

function removeAllTagsAndContentDOM(htmlString) {
    if (typeof htmlString !== "string") {
        throw new TypeError("Input must be a string");
    }

    // Create a temporary DOM element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    // Return only the plain text (tags are ignored)
    return tempDiv.textContent.trim();
}

function refreshCreatorsList() {

}

function updateTitle(title) {
    /* 
        Display a clean project title for the page title,
        but store the original.
    */

    let newTitleOld = new Amp().Stickerify(title); // Turn any '%sticker=""' into html
    const newTitle = removeAllTagsAndContentDOM(newTitleOld); // remove html
    newTitleOld = new Amp().Stickerify(removeAllTagsAndContentDOM(title));
    console.log(newTitle);
    document.title = newTitle;

    // Continue to use old title for storage
    fetch(`/api/projects/change/title/${getProjectId()}`, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ title }),
    });
}

async function toggleLike() {
    const pid = getProjectId();
    const btn = document.getElementById("like-button");

    if (btn.innerText.startsWith("Like")) {
        const res = await fetch(`/api/projects/${pid}/like`, { method: "POST" });
        if (res.ok) {
            btn.innerHTML = `Unlike <img class="sticker" src="/Images/Unlike project.png" style="margin: 0px; margin-left: 5px; margin-bottom: -5px;">`;
            loadStats();
        }
    } else {
        const res = await fetch(`/api/projects/${pid}/like`, { method: "DELETE" });
        if (res.ok) {
            btn.innerHTML = `Like <img class="sticker" src="/Images/Like project.png" style="margin: 0px; margin-left: 5px; margin-bottom: -5px;">`;
            loadStats();
            try {
                new Audio("/Audio/glass1.mp3").play();
                new Audio("/Audio/glass2.mp3").play();
            } catch (e) { }
        }
    }
}

async function toggleFavorite() {
    const pid = getProjectId();
    const btn = document.getElementById("favorite-button");

    if (btn.innerText.startsWith("Add")) {
        const res = await fetch(`/api/projects/${pid}/favorite`, { method: "POST" });
        if (res.ok) {
            btn.innerText = "Unfavorite";
            loadStats();
        }
    } else {
        const res = await fetch(`/api/projects/${pid}/favorite`, { method: "DELETE" });
        if (res.ok) {
            btn.innerHTML = `Add to Favorites <img class="sticker" src="/Images/AddToFavorites.png" style="margin: 0px; margin-left: 10px; margin-bottom: -5px;">`;
            loadStats();
        }
    }
}

async function loadStats() {
    const pid = getProjectId();
    const res = await fetch(`/api/projects/${pid}/stats`);
    if (!res.ok) return;
    const data = await res.json();

    document.getElementById("likes-count").innerText = data.likes || 0;
    document.getElementById("favorites-count").innerText = data.favorites || 0;
    document.getElementById("comments-count").innerText = data.comments || 0;
    document.getElementById("views-count").innerText = data.views || 0;

    // Update button labels depending on whether the user has liked/favorited
    if (data.userLiked) {
        document.getElementById("like-button").innerHTML = `Unlike <img class="sticker" src="/Images/Unlike project.png" style="margin: 0px; margin-left: 5px; margin-bottom: -5px;">`;
    }
    if (data.userFavorited) {
        document.getElementById("favorite-button").innerText = "Unfavorite";
    }
}

function updateDescription(description) {
    /*
        Display a clean project description for the page,
        but store the original raw string.
    */

    // Convert stickers to HTML for display
    let processed = new Amp().Stickerify(description);

    // Linkify @mentions and URLs
    processed = new Amp().linkify(processed);

    // Sanitize for safe display
    const cleanDesc = removeAllTagsAndContentDOM(processed);

    console.log(cleanDesc);

    // Update DOM with processed HTML (stickers + links)
    document.getElementById("project-description").innerHTML = processed;

    // Store raw description string in backend
    fetch(`/api/projects/change/description/${getProjectId()}`, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ description }), // raw text only
    });
}

function addSharingOptions() {
    const currentHost = window.location.host;
    const html = `
        <h3>Share your project with others!</h3>
        <h4>Embed This project:</h4>
        <div id="project-embed">
            <p>Embed as an object:</p>
            <textarea>&lt;object data="//${currentHost}/embed/projects/${getProjectId()}/" type="text/html" style="zoom:0.5;" width="1000" height="500"&gt;&lt;/object&gt;</textarea>
            <p>Embed as a picture:</p>
            <textarea>&lt;a href="//${currentHost}/projects/${getProjectId()}/"&gt; &lt;h3&gt; Project \`${project.info["project-name"]}\` on <a href="//${currentHost}/">Coco!</a> &lt;/h3&gt; &lt;a href="//${currentHost}/projects/${getProjectId()}/"&gt; &lt;img width="500px" width="500px" src="//${currentHost}/api/projects/${getProjectId()}/thumbnail"&gt; &lt;p&gt;View this project on Coco!&lt;/p&gt; &lt;/a&gt;</textarea>
        </div>
    `;
    window.document.getElementById("sharing-options").innerHTML = html;
}

function setTitle(title) {
    title = new Amp().Stickerify(title); // Turn any '%sticker=""' into html
    const newTitle = removeAllTagsAndContentDOM(title); // remove html
    console.log(newTitle);
    document.title = newTitle;
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

async function loadComments() {
    const res = await fetch(`/api/projects/${getProjectId()}/comments`);
    const comments = await res.json();

    console.log(comments);

    const commentsList = document.getElementById("comments");
    commentsList.innerHTML = "<hr style='width: 747px'>";

    // Show newest first
    comments.slice().reverse().forEach(c => {
        const li = document.createElement("li");
        const at = new Amp();
        li.classList.add("comment");
        c.message = at.Stickerify(at.linkify(c.message.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>")));
        c.message = c.message;
        li.innerHTML = `
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
          <button class="report" onclick="report('comment', ${c.id})">Report</button> ${(project.info.owner.username == username) ? `<button onclick="deleteComment(${c.id});">Delete</button>` : ""}
          </ul>
      </div>
      <hr style="width: 747px">
    `;
        commentsList.appendChild(li);
    });
    commentsList.innerHTML = new Amp().linkify(new Amp().Stickerify((commentsList.innerHTML)));
    document.getElementById("comments-count").innerText = comments.length;
}

// May throw in embed mode
try {
    document.getElementById("post-comment").addEventListener("click", async () => {
        const textarea = document.getElementById("comment-text");
        const message = textarea.value.trim();

        if (!message) {
            document.getElementById("comment-server-response").innerHTML = "Comment cannot be empty.";
            return;
        }

        try {
            const response = await fetch(`/api/projects/${getProjectId()}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            document.getElementById("comment-server-response").innerHTML = data.status || "Comment posted!";
            textarea.value = ""; // clear after posting

            // Reload comments list
            loadComments();
        } catch (err) {
            console.error(err);
            document.getElementById("comment-server-response").innerHTML = "Error posting comment.";
        }
    });

    document.getElementById("cancel-comment").addEventListener("click", () => {
        document.getElementById("comment-text").value = "";
        document.getElementById("comment-server-response").innerHTML = "";
    });

    // Refresh page details
    function updatePage(...args) {
        loadComments();
    }

    setInterval(updatePage, 1000 * 30);
} catch (error) { } try {
    function prepareAudioPlayer() {
        const audio = document.getElementById('audio');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const seekSlider = document.getElementById('seekSlider');
        const timeDisplay = document.getElementById('timeDisplay');

        // Format seconds into mm:ss
        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s.toString().padStart(2, '0')}`;
        }

        // Play/Pause toggle
        playPauseBtn.addEventListener('click', () => {
            if (playPauseBtn.textContent === 'Start') {
                // Add a view on start.
                recordView();
            }
            if (audio.paused) {
                audio.play();
                lowerMusic(true);
                playPauseBtn.textContent = 'Pause';
            } else {
                audio.pause();
                raiseMusic();
                playPauseBtn.textContent = 'Play';
            }
        });

        // Update slider max when metadata is loaded
        audio.addEventListener('loadedmetadata', () => {
            seekSlider.max = audio.duration;
            timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });

        // Update slider and time display as audio plays
        audio.addEventListener('timeupdate', () => {
            seekSlider.value = audio.currentTime;
            timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        });

        // Seek when slider is moved
        seekSlider.addEventListener('input', () => {
            audio.currentTime = seekSlider.value;
        });
    }

} catch (error) {
}

loadProjectAndDisplay();

console.log("Project.js End!");