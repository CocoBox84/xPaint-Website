class XPaintConnection extends SubdomainForeignConnection {
	constructor() {
		super("xPaint");
	}

	async uploadProject(id, file) {
		return await this.uploadFile(`/api/projects/${id}/upload/paintfile/`, file);
	}

	async createNewProject(
		title,
		description,
		file
	) {
		const form = new FormData();

		form.append("title", title);
		form.append(
			"description",
			description || ""
		);

		form.append(
			"file",
			file
		);

		const response = await fetch(
			`${this.base}/api/projects/new/upload/paintfile/`,
			{
				method: "POST",
				credentials: "include",
				body: form
			}
		);

		return await response.json();
	}

	async createPost(
		title,
		content
	) {
		return await this.post(
			"/api/posts",
			{
				title,
				content
			}
		);
	}

	async listMyProjects() {
		return await this.get("/api/mystuff/projects");
	}

	async get25NewestSharedProjects(offset) {
		return await this.get('/api/projects/list/' + offset + '/');
	}
}

SubdomainForeignConnection.connector = XPaintConnection;