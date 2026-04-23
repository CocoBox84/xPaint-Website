class XPaintConnection extends SubdomainForeignConnection {
    constructor() {
        super("xPaint");
    }

    uploadProject(id, file) {
        return this.uploadFile(`/api/projects/${id}/upload/paintfile/`, file);
    }

    async listMyProjects() {
        return this.get("/api/mystuff/projects");
    }
}
