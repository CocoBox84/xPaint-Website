const ruleAPI = new RulesApi();
const rulesContainer = document.getElementById("rules-container");
const addRuleBtn = document.getElementById("add-rule-btn");
const form = document.getElementById("create-board-form");

function renderRules() {
    rulesContainer.innerHTML = "";

    ruleAPI.pullRules().forEach((rule, index) => {
        const div = document.createElement("div");
        div.className = "rule-box";

        div.innerHTML = `
        <div>
            <h4>Rule ${index + 1}</h4>
            <label>Name:</label>
            <input type="text" class="rule-name" value="${rule.name}">
            <br>
            <label>Description:</label>
            <br>
            <textarea class="rule-description">${rule.description}</textarea>
            <br>
            <label>Severity:</label>
            <select class="rule-severity">
                <option value="low" ${rule.severity === "low" ? "selected" : ""}>Low</option>
                <option value="medium" ${rule.severity === "medium" ? "selected" : ""}>Medium</option>
                <option value="high" ${rule.severity === "high" ? "selected" : ""}>High</option>
            </select>
            <br>
            <label>Action Taken:</label>
            <input type="text" class="rule-action" value="${rule.action}">
            <br>
            <button type="button" class="remove-rule-btn">Remove Rule</button>
            <hr>
            </div>
        `;

        // Remove rule
        div.querySelector(".remove-rule-btn").addEventListener("click", () => {
            ruleAPI.removeRule(index);
            renderRules();
        });

        // Update rule live
        div.querySelector(".rule-name").addEventListener("input", e => rule.name = e.target.value);
        div.querySelector(".rule-description").addEventListener("input", e => rule.description = e.target.value);
        div.querySelector(".rule-severity").addEventListener("change", e => rule.severity = e.target.value);
        div.querySelector(".rule-action").addEventListener("input", e => rule.action = e.target.value);

        rulesContainer.appendChild(div);
    });
}

addRuleBtn.addEventListener("click", () => {
    ruleAPI.addRule({
        name: "",
        description: "",
        enforced: true,
        severity: "low",
        action: "",
        "created-by": window.currentUser || "unknown",
        "created-at": new Date().toISOString(),
        rule: {
            type: "custom",
            parameters: {}
        }
    });

    renderRules();
});

async function createBoard() {
    const name = document.getElementById("board-name").value;
    const description = document.getElementById("board-description").value;
    const rules = ruleAPI.pullRules();

    const response = await fetch("/api/boards/create", {   // <-- FIXED (no trailing slash)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, rules })
    });

    if (response.ok) {
        const data = await response.json();
        window.location.href = `/Boards/${data.id}`;
    } else {
        alert("Error creating board.");
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const confirmed = confirm(
        "Are you sure you want to create this board? Creating a board is a serious responsibility. Remember to enforce the rules you set to maintain a healthy community."
    );

    if (confirmed) {
        createBoard();
    }
});