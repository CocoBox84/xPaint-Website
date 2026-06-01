function CreateListItemFromList(item = {}) {
    `
    <div class="project-grid-item">
              <img src="">
              <var pid>${item.id}</var>
              <span class="project-detail project-title">
              ${item.title}
              </span>
              <span class="project-detail">
                By <a href="//www.cocoink.ink/users/${item.creator.username}">${item.creator.username}</a>
              </span>
            </div>
    `
}

function createList(json_list = []) {
    `
    <div class="project-grid-item">
              <img>
              <span class="project-detail project-title">
                My First Project! ..................................................................................................................
              </span>
              <span class="project-detail">
                By <a href="//www.cocoink.ink/users/User">User</a>
              </span>
            </div>
    `
}