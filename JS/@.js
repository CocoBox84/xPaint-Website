
/* 
    Copyright 2025 (C) Coco Ink Software
    // @.js

    @.js is an library for cleaning users's names, and turning '@'s into links (Clanker sticker bonus)
    Also there is 0% clanker code here!
    "Except for at the bottom sadly, I don't know how to use regex. Sorry!"
*/

class Amp {
    invalidName;
    invalidNameAt;
    textArray;
    constructor() {
        this.invalidName = "!@#$%^&*()<>?{}+=-\"'`~\\/;:,\n "; // List of characters that are not allowed in usernames.
        this.invalidNameAt = "!#$%^&*()<>?{}+=-\"'`~\\/;:,\n "; // List of characters that are not allowed in usernames excluding the @ symbol.
        this.textArray = [];
        // Example list of valid stickers

        this.validStickers = ["Coco", "Close", "Mail", "File", "Mailbox", "Mailman", "Remix", "X", "Sticker Girl", "Sticker Face", "Rainbow non gay", "Happy", "Basketball", "Web Surfer", "Web Surfer Red", "Web Surfer Pink", "Board", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "CocoBox"];
        /*
        %sticker="Coco"
        %sticker="Close"
        %sticker="Mail"
        %sticker="File"
        %sticker="Mailbox"
        %sticker="Mailman"
        %sticker="Remix"
        %sticker="X"
        %sticker="Sticker Girl"
        %sticker="Sticker Face"
        %sticker="Rainbow non gay"
        */
    }

    /* Turn any "@" into links
    function at(text) {
        if (!text.includes("@")) return text;
        let i = text.indexOf("@");
        if (text.indexOf(i - 1) == "\\") return text.replace(/\\/g, "");
        const name = text.slice(-1, 1).trim();
        const text2 = `<a href="/users/${name}/">@${name}</a>`;
        return text2;
    }
    
    /* Turn any "@" into links
    function at(text) {
        if (!text.includes("@")) return text;
        let i = text.indexOf("@");
        if (text.indexOf(i - 1) == "\\") return text.replace(/\\/g, "");
        arrayify(text);
        const name = text.slice(i + 1, text.indexOf(invalidName, text.indexOf("@"))).trim();
        const text2 = `<a href="/users/${name}/">@${name}</a>`;
        return text2;
    }
    /* */

    at(text) {
        if (!text.includes("@")) return text;

        const i = text.indexOf("@");

        // Cancel linkification if escaped
        if (i > 0 && text[i - 1] === "\\") {
            return text.replace("\\@", "@");
        }

        // Extract substring after @
        let afterAt = text.slice(i + 1);

        // Stop at first invalid character
        let name = "";
        for (let j = 0; j < afterAt.length; j++) {
            if (this.invalidChar(afterAt[j], true)) break;
            name += afterAt[j];
        }

        // Build link
        const before = text.slice(0, i);
        const after = afterAt.slice(name.length);
        return `${before}<a href="/users/${name}/">@${name}</a>${after}`;
    }

    // Turn a string into an array by character
    arrayify(string) {
        const array = [];
        for (let i = 0; i < string.length; i++) {
            array.push(string[i]);
        }
        return array;
    }

    // Turn a string into an array by White Space
    arrayifyWS(string) {
        const array = [];
        let string2 = "";
        for (let i = 0; i < string.length; i++) {
            if (string[i] !== " ") {
                string2 += string[i];
            } else {
                array.push(string2);
                if (string[i] == " ") array.push(" "); // Always push a space if a space belongs here
                string2 = "";
            }
        }
        array.push(string2); // Push again to add contents.
        return array;
    }

    // Turn a string into an array by invalid username characters
    arrayifyInv(string) {
        const array = [];
        let string2 = "";
        for (let i = 0; i < string.length; i++) {
            // Exclude the @ symbol
            if (!this.invalidChar(string[i], false)) {
                string2 += string[i];
            } else {
                array.push(string2);
                if (string[i] === " ") array.push(" ");
                string2 = "";
            }
        }
        array.push(string2); // Push again to add contents.
        return array;
    }

    invalidChar(char, at) {
        if (at) {
            if (this.invalidName.includes(char)) return true;
            else return false;
        } else {
            if (this.invalidNameAt.includes(char)) return true;
            else return false;
        }
    }

    // Sanitize usernames and split it at invalid characters
    cleanNameSplit(name) {
        //console.log("cleaning");
        let string = "";
        let inv = "";
        let i2;
        let valid = true;
        for (let i = 0; i < name.length; i++) {
            if (this.invalidChar(name[i], true)) {
                i2 = i;
                valid = false;
                break;
            }
            else string += name[i];
        }
        for (let i = i2; i < name.length; i++) {
            inv += name[i];
        }
        //console.log("Cleaned");
        return [string, inv];
    }

    // Sanitize usernames without splitting it at invalid characters
    cleanNameNonSplit(name) {
        //console.log("cleaning");
        let string = "";
        for (let i = 0; i < name.length; i++) {
            if (this.invalidChar(name[i], true)) {
                continue;
            }
            else string += name[i];
        }
        //console.log("Cleaned");
        return string;
    }

    // Sanitize message to prevent html injection
    cleanMessage(name) {
        //console.log("cleaning");
        let string = "";
        for (let i = 0; i < name.length; i++) {
            if (this.isHtml(name[i], true)) {
                continue;
            }
            else string += name[i];
        }
        //console.log("Cleaned");
        return string;
    }

    // Normalize arrays into strings
    normalize(array) {
        let string = "";
        array.forEach(function (block) {
            string += block;
        });
        return string;
    }

    linkify(text) {
        if (typeof text !== "string") return "";

        // Handle @mentions (keeping escaped @)
        let processed = text.replace(/(^|[^\\])@([A-Za-z0-9_]+)/g, (match, prefix, name) => {
            return `${prefix}<a href="/users/${name}/">@${name}</a>`;
        }).replace(/\\@/g, "@"); // keep escaped @

        /*
        // Handle #hashtags (keeping escaped #)
        processed = processed.replace(/(^|[^\\])#([A-Za-z0-9_]+)/g, (match, prefix, tag) => {
            return `${prefix}<a href="/tags/${tag}">#${tag}</a>`;
        }).replace(/\\#/g, "#"); // keep escaped #
        */

        // Handle URLs (http, https, ftp, www.)
        const urlPattern = /(\b(https?|ftp):\/\/[^\s]+|\bwww\.[^\s]+)/gi;
        processed = processed.replace(urlPattern, function (url) {
            let href = url;
            // Add http:// if missing
            if (!/^https?:\/\//i.test(href) && !/^ftp:\/\//i.test(href)) {
                href = 'http://' + href;
            }
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });

        return processed;
    }

    stripBetweenQuotes(str) {
        if (typeof str !== 'string') {
            throw new TypeError('Input must be a string');
        }
        const match = str.match(/"([^"]*)"/);
        return match ? match[1] : null;
    }

    // !!Clanker code below:!!

    Stickerify(str = "") {
        // Regex to find %sticker="name"
        // Allow this quotes to work, fixes iOS bug
        str = str.replaceAll("“", '"');
        str = str.replaceAll("”", '"');

        return str.replace(/%sticker="([^"]+)"/g, (match, stickerName) => {
            // Check if sticker is valid
            if (this.validStickers.includes(stickerName)) {
                // Replace with image tag
                return `<img src="/Stickers/${stickerName}.stikr" alt="{\"${stickerName}\" Sticker.}" class="sticker">`;
            } else {
                // If invalid, leave text or replace with a warning
                return match;
            }
        });
    }
}

const isNode = // Source - https://stackoverflow.com/a
    // Posted by Florian Neumann, modified by community. See post 'Timeline' for change history
    // Retrieved 2025-11-13, License - CC BY-SA 4.0

    (typeof process !== 'undefined') && (process.release.name === 'node')
if (isNode)
    module.exports = { Amp };