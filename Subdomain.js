const Subdomain = new XPaintConnection();

async function onPageLoad(params) {
    const record = await Subdomain.isLoggedIn();
    const right_header = document.getElementById("user-controls");

    if (record == "fail") {
        right_header.innerHTML = `<p><span style="margin-right: 10px;">Logged in as</span>></p>`;
        return;
    }
    console.log("User: ", record || "User is not logged in.");
    if (!record) return;
    right_header.innerHTML = `<p><span style="margin-right: 10px;">Logged in as</span><a href="${CocoUrl}/users/${record?.username}">${record?.username} <img style="margin-left: 10px; padding: 5px; background-color: white;" width="25px" height="25px" src="${CocoUrl}/users/${record?.username}/pfp"></a></p>`;
}

document.addEventListener("DOMContentLoaded", onPageLoad);