async function get25FromServer(offset) {
    const projects = await Subdomain.get25NewestSharedProjects();

    if (!projects) {
        return "<p>Error loading projects!</p>";
    }

    if (projects.length < 1) {
        return "<p>No projects to show...</p>";
    }

    return projects.map(project => {
        const helpers = project.creators.slice(1).join(", ");

        return `
            <div class="project-grid-item" data-project-id="${project.id}">
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