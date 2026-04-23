const Subdomain = new XPaintConnection();
async function onPageLoad(params) {
    const record = await Subdomain.isLoggedIn();
    console.log("User: ", record || "User is not logged in.");
    if (!record) return;
    const right_header = document.getElementById("user-controls");
    right_header.innerHTML = `<p><span style="margin-right: 10px;">Logged in as</span><a href="//www.cocoink.ink/${record?.username}">${record?.username}</a></p>`;
}

document.addEventListener("DOMContentLoaded", onPageLoad);