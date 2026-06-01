// SubdomainForeignConnection.js

const CocoUrl = (!true) ? `https://www.cocoink.ink` : "http://127.0.0.1:5500";

class SubdomainForeignConnection {
    constructor(name) {
        // Example: name = "xPaint"
        this.name = name;

        // Backend endpoint for this foreign module
        this.base = `${CocoUrl}/f/${name}`;
    }

    // Generic GET request
    async get(path, usebase=false) {
        try {
            const url = !usebase ? `${this.base}${path}` : `${CocoUrl}${path}`;

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
