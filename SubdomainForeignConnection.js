// SubdomainForeignConnection.js

// Why have more then one backend? I can't afford any more.
// So for any Coco subdomains, we connect through the main Coco backend, through
// this frontend.

const CocoUrl = (document.location.host == "xpaint.cocoink.ink") ? `https://www.cocoink.ink` : "http://127.0.0.1:5500";
console.log(document.location.host);

class SubdomainForeignConnection {

    static connector = this;

    constructor(name) {
        // Example: name = "xPaint"
        this.name = name;

        // Backend endpoint for this foreign module
        this.base = `${CocoUrl}/f/${name}`;
    }

    static createSubdomain() {
        return new this();
    }

    // Generic GET request
    async get(path, usebase=false) {
        try {
            const url = !usebase ? `${this.base}${path}` : `${CocoUrl}${path}`;
            console

            const res = await fetch(url, {
                method: "GET",
                credentials: "include" // IMPORTANT: send 
            });

            const responseText = await res.text();

            console.log(responseText);

            if (responseText === "Not logged in") {
                console.log("Nof user");
                return null;
            }

            console.log("Continue");

            return JSON.parse(responseText);
        } catch (e) {
            console.log(e);
            if (path == "/api/whoami") return "fail";
            return null;
        }
    }

    // Generic POST request
    async post(path, data = {}) {
        try {
            const url = `${this.base}${path}`;

            const res = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            return res.json();
        } catch {
            return null;
        }
    }

    // Check if user is logged in
    async requireLogin() {
        const result = await this.get("/api/whoami");

        if (result?.id) {
            this.userId = result.id;
            return result;
        }

        // Not logged in → redirect to main site login
        window.location.href = `${CocoUrl}/login?redirect=${encodeURIComponent(window.location.href)}`;
    }

    async isLoggedIn() {
        const result = await this.get("/api/whoami", true);

        if (result == "fail") return result;

        if (result?.id) {
            this.userId = result.id;
            return result;
        }

        return false;
    }

    // Optional: upload file (foreign modules can override)
    async uploadFile(path, file) {
        const url = `${this.base}${path}`;

        const form = new FormData();
        form.append("file", file);

        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: form
        });

        return res.json();
    }
}
