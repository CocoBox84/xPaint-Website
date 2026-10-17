const Subdomain = new SubdomainForeignConnection.connector();

async function onPageLoad(e) {
    getAndDisplayUser();
}

async function displayUser(record) {
    const right_header = document.getElementById("user-controls");

    if (record == "fail") {
        right_header.innerHTML = `<p><span style="margin-right: 10px;">Failed to log in!</span></p>`;
        return;
    }

    console.log("User: ", record || "User is not logged in.");
    if (!record) return;
    right_header.innerHTML = `<p style="align-content: center !important; justify-content: center !important;"><span style="margin-right: 10px;">Logged in as</span><a href="${CocoUrl}/users/${record?.username}">${(record?.username?.length < 37) ? record?.username : `${record?.username?.substring(0, 37)}...`} <img style="margin-left: 10px; border: darkgray 1px solid; border-radius: 10px; background-color: white;" width="30px" height="30px" src="${CocoUrl}/users/${record?.username}/pfp"></a></p>`;
}

async function getAndDisplayUser() {
    let record = localStorage.getItem("CocoLoggedInUserForForeignConnections");

    try {
        const parsed = JSON.parse(record);
        const time = parsed.time;

        if (!time || isNaN(time)) throw "Invalid time";

        const age = Date.now() - time;

        // If older than 5 seconds, refresh
        if (age > 5000) throw "Cache expired";

        console.log("Using cached version.");

        // Still fresh → use cached username
        displayUser(parsed);
        return;

    } catch {
        console.log("Getting fresh username.");

        // Cache missing, invalid, or expired → fetch fresh user
        const fresh = await Subdomain.isLoggedIn();
        if (fresh == "fail") return fresh;

        if (fresh?.username) {
            const user = {
                username: fresh.username,
                id: fresh.id,
                time: Date.now()
            };

            localStorage.setItem(
                "CocoLoggedInUserForForeignConnections",
                JSON.stringify(user)
            );

            displayUser(fresh);
            return;
        }
    }

    displayUser("fail");
}


document.addEventListener("DOMContentLoaded", onPageLoad);