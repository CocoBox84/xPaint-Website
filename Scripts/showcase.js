var isFlash = false;

var flashButCanUseRuffle = false;

var isScratch = false;

var scratchVersions = [1.0, 2.0, 3.0];

var isCoco = false;

var CocoVersion = [];

var noRuffleWarning = "";

var isFullScreen = false;

var hasFlash = true;

var hasPlugins = false;

 document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        const player = document.getElementById("player");
        player.classList.remove("player-fullscreen");
        player.classList.add("player-embedded");
    });
 });

function JSsetPresentationMode(p1) {
    console.log(p1);
    const object = document.getElementById("Player");
    const Player = document.getElementById("player");
    console.log("I'm Interacting With A swf File!");
    if (isFullScreen) {
        isFullScreen = false;
        object.classList.remove("player-fullscreen");
        object.classList.add("player-embedded");

        Player.classList.remove("Player-fullscreen");
        Player.classList.add("Player-embedded");
    } else {
        isFullScreen = true;
        object.classList.add("player-fullscreen");
        object.classList.remove("player-embedded");

        Player.classList.add("Player-fullscreen");
        Player.classList.remove("Player-embedded");
    }
}