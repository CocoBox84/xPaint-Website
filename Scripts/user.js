// Scripts/user.js
console.log('User.js started!');

function getFromServer(url) {
    // Basic GET request
    let data1;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        })
        .then(data => {
            console.log(data); // Handle the data
            data1 = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    return data1;
}

async function followUser(username) {
    console.log("Following...");
    const res = await fetch(`/api/follow/${username}/`, { method: "POST" });
    if (res.status !== 200) {
        const a = await res.text();
        new AlertBanner("Unable to follow user", a);
        return;
    }
    window.document.querySelectorAll("follow_unfollow").forEach((b) => {
        if (b.dataset.username === username) {
            b.innerHTML = "Unfollow";
            b.setAttribute("onclick", `unfollowUser(${username});`);
        } else {
            console.log("Skipped");
        }
    });
    new AlertBanner(`You are now following ${username}.`);
}

async function unfollowUser(username) {
    console.log("Unfollowing...");
    const res = await fetch(`/api/unfollow/${username}/`, { method: "POST" });
    if (res.status !== 200) {
        const a = await res.text();
        new AlertBanner("Unable to unfollow user", a);
        return;
    }
    window.document.querySelectorAll("follow_unfollow").forEach(b => {
        if (b.dataset.username === username) {
            b.innerHTML = "Follow";
            b.setAttribute("onclick", `followUser(${username});`);
        } else {
            console.log("Skipped");
        }
    });
    new AlertBanner(`You are no longer following ${username}.`);
}

function updateProfile() {
    const descriptionDiv = document.getElementById("description");
    const CocoScriptCodeDiv = document.getElementById("Coco-Script-area");
    const description = descriptionDiv.value;
    const CocoScriptCode = CocoScriptCodeDiv.value;

    fetch("/api/set/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, CocoScriptCode })
    })
        .then((response) => response.json())
        .then((result) => { console.log("Success:", result); window.location.href = window.location.href; })
        .catch((error) => console.error("Error:", error));
}