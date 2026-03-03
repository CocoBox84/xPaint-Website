var errorMessages = ["Some Scripts Have Probably Crashed", "<h2>Sorry! But the Coco Website will not work with your Web Browser.</h2>"];
showError(1, new Error("Your Web Browser is to stupid to understand JavaScript Classes."));
var isOld = false;
try {
    eval("class a{s; constructor() {}};");
} catch (error) {
    isOld = true;
}

if (isOld) throw new Error("Your Web Browser is to stupid to understand JavaScript Classes.");

document.addEventListener("DOMContentLoaded", () => {
    /* Aa *
    showError(); /* Aa */
    /* Aa */
    showMessage();
});

function showError(errorType, error = new Error()) {
    document.getElementById("e").innerHTML = "<h1>Oops! Something Crashed!</h1>" + errorMessages[errorType] + "<h2>Error:</h2> <p>" + error.message + "</p>";
    var errorContainer = document.getElementById("error-container");
    errorContainer.classList.remove("error-container-hide");
    errorContainer.classList.add("error-container-show");
}

function hideError() {
    document.getElementById("e").innerHTML = ``;
    var errorContainer = document.getElementById("error-container");
    errorContainer.classList.remove("error-container-show");
    errorContainer.classList.add("error-container-hide");
}

function showMessage(messageAtIndex) {
    var messageBox;
    switch (messageAtIndex) {
        case 5:
            //
            break;
    }
}

try {
    const errorMessageContainer = document.getElementById("error-container");

    function clearError() {
        errorMessageContainer.classList.remove("error-container-show");
        errorMessageContainer.classList.add("error-container-hide");
        document.getElementById("e").innerHTML = ``;
        var errorContainer = document.getElementById("error-container");
        errorContainer.classList.remove("error-container-show");
        errorContainer.classList.add("error-container-hide");
    };

    window.document.querySelectorAll('iframe').forEach(embed => {
        embed.addEventListener("mouseover", () => {
            console.log("iframe focus.");
            lowerMusic();
        });
        embed.addEventListener("mouseout", () => {
            console.log("iframe blur.");
            raiseMusic();
        });
    });

        window.document.querySelectorAll('object').forEach(object => {
        object.addEventListener("mouseover", () => {
            console.log("Object focus.");
            lowerMusic();
        });
        object.addEventListener("mouseout", () => {
            console.log("Object blur.");
            raiseMusic();
        });
    });

    // Add event listeners for video.
    window.document.querySelectorAll('video').forEach(video => {
        video.addEventListener('play', () => {
            lowerMusic();
        });
        video.addEventListener('pause', () => {
            raiseMusic();
        });
        video.addEventListener('ended', () => {
            raiseMusic();
        });
    });

    // Add event listeners for audio.
    window.document.querySelectorAll('audio').forEach(video => {
        video.addEventListener('play', () => {
            lowerMusic();
        });
        video.addEventListener('pause', () => {
            raiseMusic();
        });
        video.addEventListener('ended', () => {
            raiseMusic();
        });
    });

    let sidebar = document.getElementById("main-nav-box");

    document.addEventListener("DOMContentLoaded", onPageLoad);
    sidebar.classList.add("navigation-box");

    const Sidebar = `
  <div id="sidebar-buttons">
    <button class="sidebar-button" id="sidebar-about-button"><img src="/Stickers/Old Coco Icon.stikr"><br>Coco</button>
    <button class="sidebar-button" id="sidebar-help-button"><img src="/Stickers/Question Mark.stikr"><br>Help</button>
    <button class="sidebar-button" id="sidebar-messages-button"><img src="/Stickers/Mail.stikr"><br>Mailbox</button>
    <button class="sidebar-button" id="sidebar-close-button"><img src="/Stickers/Close.stikr"><br>Close</button>
  </div>
  <iframe id="sidebar-content" src="about:blank">
  </iframe>
`;

    function navBoxClick() {
        console.log("Sidebar clicked!");
        sidebar.classList.toggle("open");
        sidebar.classList.toggle("closed");
    }

    function navBoxOpen(page, params) {
        sidebar.classList.remove("closed");
        sidebar.classList.add("open");
        switch (page) {
            case "about": {
                document.getElementById("sidebar-content").src = "/sidebar/help/screens/about/";
            } break;
            case "help": {
                document.getElementById("sidebar-content").src = "/sidebar/help/screens/help/";
            } break;
            case "messages": {
                document.getElementById("sidebar-content").src = "/sidebar/help/screens/mailbox/?" + params;
            } break;
            case "close": {
                document.getElementById("sidebar-content").src = "about:blank";
                navBoxClose();
            } break;
            default: {
                document.getElementById("sidebar-content").src = "about:blank";
                navBoxClose();
            } break;
        }
    }

    function navBoxClose() {
        sidebar.classList.add("closed");
        sidebar.classList.remove("open");
    }

    async function report(type, id) {
        const reason = prompt("Why are you reporting this " + type + "?");
        if (!reason) return;

        const res = await fetch(`/api/report/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                why: reason,
                linkage: id,
                details: window.location.href
            })
        });

        const data = await res.json();
        alert(data.status || "Report sent.");
    }

    function switchTab(tab, type = "page") {
        const url = new URL(window.location.href);
        url.searchParams.set(type, tab);
        window.location.href = url.toString();
    }

    function onPageLoad() {
        window.report = report;
        sidebar = document.getElementById("main-nav-box");
        // Reset classes
        sidebar.classList.remove("navigation-box-closed", "navigation-box-open");

        // Inject sidebar HTML first
        sidebar.innerHTML = Sidebar;

        document.getElementById("sidebar-about-button").addEventListener("click", function () { navBoxOpen("about"); });

        document.getElementById("sidebar-help-button").addEventListener("click", function () { navBoxOpen("help"); });

        document.getElementById("sidebar-messages-button").addEventListener("click", function () { navBoxOpen("messages"); });

        document.getElementById("sidebar-close-button").addEventListener("click", function () { navBoxOpen("close"); });

        // Remove both closed and open, this will push it offscreen
        sidebar.style.transition = "none";
        sidebar.classList.remove("closed");
        sidebar.classList.remove("open");

        // Add the show class, it will automatically close because the parameter is blank
        setTimeout(function () { sidebar.style.transition = ""; navBoxOpen(""); }, 1000);

    }
    hideError();
    checkForNewYearsDay();

    const newYearsInterval = setInterval(() => {
        checkForNewYearsDay();
    }, 20 * 1000);

    function checkForNewYearsDay() {
        try {
            const now = new Date();
            const isNewYearsDay = (now.getMonth() === 0 && now.getDate() === 1);

            if (isNewYearsDay) {
                document.querySelector(".new-years-banner").classList.remove("hide");
                document.querySelectorAll(".year-output").forEach(function (year_output) {
                    year_output.innerHTML = now.getFullYear();
                });
                clearInterval(newYearsInterval);
            }
        } catch (error) { };
    }

    console.log(new Date().getFullYear());
} catch (error) {
    showError(3, error);
}