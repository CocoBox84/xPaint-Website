// JS/board/board.js

class Board {
    constructor(board, permissions, user) {
        this.board = board;
        this.id = board.id;
        this.name = board.name;
        this.permissions = permissions;
        this.userRole = permissions.role;
        this.user = user;
    }

    async updateBoardSettings() {
        const name = document.getElementById("board-name-input").value;
        const description = document.getElementById("board-description-input").value;
        const isPrivate = document.getElementById("private-board-checkbox").checked;

        // Pull rules from RulesApi if needed
        const rules = window.ruleAPI ? window.ruleAPI.pullRules() : this.board.rules;

        const response = await fetch(`/Boards/${this.id}/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                description,
                isPrivate,
                rules
            })
        });

        const data = await response.json();

        if (data.status === "Board updated") {
            alert("Board settings updated!");
            location.reload();
        } else {
            alert("Error updating board: " + data.status);
        }
    }
}