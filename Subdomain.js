const Subdomain = new XPaintConnection();

async function onPageLoad(params) {
    const record = await Subdomain.isLoggedIn();
    const right_header = document.getElementById("user-controls");

    console.log(record);
    console.log(right_header);

    if (record == "fail") {
        right_header.innerHTML = `<p><span style="margin-right: 10px;">Logged in as</span>></p>`;
        return;
    }

    console.log("User: ", record || "User is not logged in.");
    if (!record) return;
    right_header.innerHTML = `<p><span style="margin-right: 10px;">Logged in as</span><a href="${CocoUrl}/users/${record?.username}">${(record?.username?.length < 37) ? record?.username : `${record?.username?.substring(0, 37)}...`} <img style="margin-left: 10px; border: darkgray 1px solid; border-radius: 10px; background-color: white;" width="30px" height="30px" src="${CocoUrl}/users/${record?.username}/pfp"></a></p>`;
}

document.addEventListener("DOMContentLoaded", onPageLoad);