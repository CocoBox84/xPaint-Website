// SubdomainForeignConnection.js

class SubdomainForeignConnection {
    constructor(name) {
        // Example: name = "xPaint"
        this.name = name;

        // Backend endpoint for this foreign module
        this.base = `https://www.cocoink.ink/f/${name}`;
    }

    // Generic GET request
    async get(path, usebase=false) {
        try {
            const url = !usebase ? `${this.base}${path}` : `https://www.cocoink.ink${path}`;

            const res = await fetch(url, {
                method: "GET",
                credentials: "include", // IMPORTANT: send 
                headers: {
                    "Access-Control-Allow-Origin": "*"
                }
            });

            return res.json();
        } catch {
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
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
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
        window.location.href = "https://www.cocoink.ink/login?redirect=" + encodeURIComponent(window.location.href);
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
