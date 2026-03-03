/* JS/boards/rules.js
    Handles the rules for boards.
 */

class RulesApi {
    constructor() {
        this.rules = [];
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    removeRule(index) {
        this.rules.splice(index, 1);
    }

    pullRules() {
        return this.rules;
    }

    getRulesFromServer(board_id) {
        return fetch(`/api/boards/${board_id}/rules/`)
            .then(res => res.json())
            .then(data => {
                this.rules = data.rules || [];
                return this.rules;
            })
            .catch(err => {
                console.error("Error fetching rules:", err);
                this.rules = [];
                return [];
            });
    }

    printRules() {
        let string = "";
        if (this.rules.length === 0) {
            return "No rules have been set for this board. Please Make sure to follow the website's <a href=\"/faq#guidelines\">community guidelines</a>!";
        }
        this.rules.forEach((rule) => {
            string += `${rule}, `;
        });
        string = string.slice(0, -2); // Remove last comma and space
        string += ` and Please Make sure to follow the website's <a href="/faq#guidelines">community guidelines</a>!`;
        return string;
    }
}