async function get25ProjectsFromServer(offset) {
    const projects = await Subdomain.get25NewestSharedProjects(offset);

    if (!projects) {
        return "<p>Error loading projects!</p>";
    }

    if (projects.length < 1) {
        return "<p>No projects to show...</p>";
    }

    return projects.map(project => {
        const helpers = project.creators.slice(1).join(", ");

        return `
            <div class="project-grid-item" onclick="redirectToProject('${project.id}')">
                <p class="project-title">${project.title}</p>
                by <a href="/user.html?user=${project.creators[0]}">${project.creators[0]}</a>
                ${
                    project.creators.length > 1
                        ? `<p>With help from: ${helpers}</p>`
                        : ""
                }
            </div>
        `;
    }).join("");
}

async function get25PostsFromServer(offset) {
    const raw = await Subdomain.get25NewestPosts(offset);
	const posts = raw.posts;

	console.log(raw);
	console.log(posts);

    if (!posts) {
        return "<p>Error loading posts!</p>";
    }

    if (posts.length < 1) {
        return "<p>No posts to show...</p>";
    }

    return posts.map(post => {
        return `
            <li onclick="redirectToPost(${post.id});" style="color: black !important; cursor: pointer;">
				<strong style="color: black !important;">${post.title}</strong>
				<p>${(post.content.length < 250) ? post.content : post.content.substring(0, 250)}</p>
				<p>by <a href="/user.html?user={post.author}">${post.author}</a></p>
			</li>
        `;
    }).join("");
}

async function redirectToProject(id) {
	window.location.href = '/project.html?id=' + id;
}

async function redirectToPost(id) {
	location.href = "/post.html?id=" + id;
}