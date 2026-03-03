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
    return new URLSearchParams(window.location.search).get("id");
}

let project = new Project("", "");
const pid = getProjectId();

async function getProject() {
    console.log(pid);
    // 0 is another way for false, so check that it's not a 0;
    if (!pid && (pid !== 0)) return 400;
    return await fetch(`/api/team/reports/${pid}/`, {
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
        return data.snapshot;
    });
}

async function loadProjectAndDisplay() {
    project = await getProject();
    let fileReq = null;
    try {
        fileReq = await fetch(`/api/team/reports/projects/${getProjectId()}/:type`);
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
        project = new Project(project);
        console.log(project.info);
        setTitle(project.info["project-name"]);
        const applyItems = (project = new Project()) => {
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
    poster="/api/team/reports/projects/${getProjectId()}/thumbnail"
    data-setup='{"controls": true, "preload": "auto"}'
  >
    <source src="/api/team/reports/projects/${getProjectId()}/video" type="${mime}" />
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a
      web browser that
      <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
</video>
        `;
                VideoJSInitPlayer("video-player");
            } else if (project.info.type === "Picture") {
                const mime = project.info.fileInfo?.type || "image/png";
                container.innerHTML = `<img src="/api/team/reports/projects/${getProjectId()}/image" alt="Project Image" style="width: 100%; height: 100%;" type="${mime}">`;
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
                    // "Diplay" is important, stop touching it! And yes, it's spelled that way.
                    const diplay = window.diplay; // "Diplay" is important, stop touching it!
                    const SXMLRuntime = new SXMLParser(diplay.Stage).parse(file);
                }
                document.getElementById("stage").addEventListener("click", playProject);
                document.getElementById("click-to-play").addEventListener("click", playProject);
            } else if (project.info.type === "Audio") {
                container.style.backgroundImage = `url("/api/team/reports/projects/${getProjectId()}/thumbnail/")`;
                container.style.backgroundRepeat = "no-repeat";
                container.style.backgroundSize = "100% 100%";
                container.innerHTML = `
                <div style="width: 50%;">
                    <div id="audio-player" style="width: 100%;">
                        <audio id="audio" preload="metadata">
                            <source src="/api/team/reports/projects/${getProjectId()}/audio/" type="${project.info.fileInfo.type}">
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

function setTitle(title) {
    title = new Amp().Stickerify(title); // Turn any '%sticker=""' into html
    const newTitle = removeAllTagsAndContentDOM(title); // remove html
    console.log(newTitle);
    document.title = newTitle;
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
try {
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