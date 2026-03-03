const COLOR_CTX = document.createElement("canvas").getContext("2d");
const isTest = false;

const NAMED = {
    orange: [255, 165, 0],
    lightgray: [211, 211, 211],
    red: [255, 0, 0],
    green: [0, 128, 0],
    blue: [0, 0, 255],
    white: [255, 255, 255],
    black: [0, 0, 0],

};

function easeOutBounce(t) {
    if (t < (1 / 2.75)) {
        return 7.5625 * t * t;
    } else if (t < (2 / 2.75)) {
        t -= (1.5 / 2.75);
        return 7.5625 * t * t + 0.75;
    } else if (t < (2.5 / 2.75)) {
        t -= (2.25 / 2.75);
        return 7.5625 * t * t + 0.9375;
    } else {
        t -= (2.625 / 2.75);
        return 7.5625 * t * t + 0.984375;
    }
}

function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const area = (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
    const s = (x1 * (py - y3) + x2 * (y3 - py) + px * (y1 - y2)) / area;
    const t = (x1 * (y2 - py) + px * (py - y1) + x3 * (y1 - y2)) / area;
    const u = 1 - s - t;
    return s >= 0 && t >= 0 && u >= 0;
}

function normalizeColor(color) {
    // Try canvas normalization
    COLOR_CTX.fillStyle = color;
    const s = COLOR_CTX.fillStyle; // "rgb(r,g,b)" or "rgba(r,g,b,a)"
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];

    // Fallback for named colors we care about
    const key = String(color).toLowerCase().trim();
    if (NAMED[key]) return NAMED[key].slice();

    // Hex fallback
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
        const hex = color.length === 4
            ? color.replace(/([0-9a-f])/gi, "$1$1")
            : color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    // Last-resort safe value
    return [0, 0, 0];
}

function rgbArrayToString(arr) {
    const r = Math.max(0, Math.min(255, Math.round(arr[0] || 0)));
    const g = Math.max(0, Math.min(255, Math.round(arr[1] || 0)));
    const b = Math.max(0, Math.min(255, Math.round(arr[2] || 0)));
    return `rgb(${r},${g},${b})`;
}

function darkenRGB([r, g, b], amount = 0.2) {
    return [
        Math.max(0, Math.floor(r * (1 - amount))),
        Math.max(0, Math.floor(g * (1 - amount))),
        Math.max(0, Math.floor(b * (1 - amount)))
    ];
}

function lerpRGB(a, b, t) {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
    ];
}

class Stage {
    constructor() {
        this.Element = document.getElementById("stage");
        this.Graphics = this.Element.getContext("2d");
        this.buttons = [];
        this.shapes = [];
        this.hoveredButton = null;
        this.pressedButton = null; // track click animation

        this.Element.addEventListener("mousemove", (evt) => {
            const rect = this.Element.getBoundingClientRect();
            const mx = evt.clientX - rect.left;
            const my = evt.clientY - rect.top;

            const top = [...this.buttons]
                .sort((a, b) => (b.z || 0) - (a.z || 0))
                .find(btn => mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h);

            this.buttons.forEach(btn => {
                const shouldHover = (btn === top);
                if (btn.hovered !== shouldHover) {
                    btn.hovered = shouldHover;
                    const target = shouldHover ? btn.hoverRGB : btn.baseRGB;
                    this.animateButtonTo(btn, target);
                }
            });
        });

        this.Element.addEventListener("mouseleave", () => {
            this.buttons.forEach(btn => {
                if (btn.hovered || btn.pressed) {
                    btn.hovered = false;
                    btn.pressed = false;
                    this.animateButtonTo(btn, btn.baseRGB);
                }
            });
        });

        this.Element.addEventListener("mousedown", (evt) => {
            const rect = this.Element.getBoundingClientRect();
            const mx = evt.clientX - rect.left;
            const my = evt.clientY - rect.top;

            const top = [...this.buttons]
                .sort((a, b) => {
                    const za = a.z || 0, zb = b.z || 0;
                    if (za !== zb) return zb - za; // higher z first
                    return b.order - a.order;      // later added first
                })
                .find(btn => mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h);

            if (top) {
                top.pressed = true;
                this.animateButtonTo(top, top.pressedRGB, 0.95, 150);
            }
        });

        this.Element.addEventListener("mouseup", () => {
            const pressed = this.buttons.find(btn => btn.pressed);
            if (pressed) {
                if (pressed.action) new CocoScriptEngine().run(pressed.action);
                pressed.pressed = false;
                const target = pressed.hovered ? pressed.hoverRGB : pressed.baseRGB;
                this.animateButtonTo(pressed, target, 1.0, 300);
            }
        });

    }

    clear() {
        this.Graphics.clearRect(0, 0, this.Element.width, this.Element.height);
    }

    // add shape to list and draw it
    addShape(type, props, z = 0) {
        this.shapes.push({ type, ...props, z });
        this.drawShape(this.shapes[this.shapes.length - 1]);
    }

    drawShape(shape) {
        if (shape.type === "Square") {
            this.Shapes.Square(shape.w, shape.h, shape.x, shape.y, shape.color);
        }
        if (shape.type === "Circle") {
            this.Shapes.Circle(shape.r, shape.x, shape.y, shape.color);
        }
        if (shape.type === "Text") {
            this.Shapes.Text(shape.text, shape.x, shape.y, shape.color, shape.font);
        }
    }

    blendColors(c1, c2, t) {
        const rgb1 = parseColor(c1);
        const rgb2 = parseColor(c2);
        const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
        const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
        const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
        return `rgb(${r},${g},${b})`;
    }

    animateButtonTo(btn, targetRGB, targetScale = 1.0, duration = 300) {
        if (btn.animRAF) cancelAnimationFrame(btn.animRAF);

        const startRGB = btn.currentRGB.slice();
        const startScale = btn.currentScale;
        const start = performance.now();

        const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            // linear for color
            btn.currentRGB = lerpRGB(startRGB, targetRGB, t);
            // bounce easing for scale
            const eased = easeOutBounce(t);
            btn.currentScale = startScale + (targetScale - startScale) * eased;

            this.redraw();
            btn.animRAF = t < 1 ? requestAnimationFrame(step) : null;
        };

        btn.animRAF = requestAnimationFrame(step);
    }

    addButton(label, x, y, w, h, bgColor = "lightgray", textColor = "black", action = null, z = null, shape = "rect") {
        if (z == null) z = this.buttons.length;
        const baseRGB = normalizeColor(bgColor);
        const hoverRGB = darkenRGB(baseRGB, 0.2);
        const pressedRGB = darkenRGB(hoverRGB, 0.3);

        const btn = {
            label, x, y, w, h, z, action,
            textColor,
            baseRGB, hoverRGB, pressedRGB,
            currentRGB: baseRGB.slice(),
            currentScale: 1.0,
            hovered: false,
            pressed: false,
            animRAF: null,
            shape
        };


        this.buttons.push(btn);
        this.drawButton(btn);
    }

    drawButton(btn) {
        if (!btn.currentRGB || btn.currentRGB.length !== 3) {
            btn.currentRGB = btn.baseRGB.slice();
        }
        const colorStr = rgbArrayToString(btn.currentRGB);

        const cx = btn.x + btn.w / 2;
        const cy = btn.y + btn.h / 2;
        const radius = Math.min(btn.w, btn.h) / 2;

        this.Graphics.save();
        this.Graphics.translate(cx, cy);
        this.Graphics.scale(btn.currentScale, btn.currentScale);
        this.Graphics.translate(-cx, -cy);

        this.Graphics.fillStyle = colorStr;
        this.Graphics.strokeStyle = "black";

        if (btn.shape === "circle") {
            this.Graphics.beginPath();
            this.Graphics.arc(cx, cy, radius, 0, Math.PI * 2);
            this.Graphics.fill();
            this.Graphics.stroke();
        } else if (btn.shape === "play") {
            // Right-pointing triangle
            this.Graphics.beginPath();
            this.Graphics.moveTo(btn.x, btn.y);                 // top left
            this.Graphics.lineTo(btn.x, btn.y + btn.h);         // bottom left
            this.Graphics.lineTo(btn.x + btn.w, btn.y + btn.h / 2); // right middle
            this.Graphics.closePath();
            this.Graphics.fill();
            this.Graphics.stroke();
        } else if (btn.shape === "triangle") {
            // Equilateral-style triangle
            this.Graphics.beginPath();
            this.Graphics.moveTo(btn.x + btn.w / 2, btn.y);       // top
            this.Graphics.lineTo(btn.x, btn.y + btn.h);         // bottom left
            this.Graphics.lineTo(btn.x + btn.w, btn.y + btn.h); // bottom right
            this.Graphics.closePath();
            this.Graphics.fill();
            this.Graphics.stroke();
        } else {
            // Default rectangle
            this.Graphics.fillRect(btn.x, btn.y, btn.w, btn.h);
            this.Graphics.strokeRect(btn.x, btn.y, btn.w, btn.h);
        }

        // Draw label centered (optional for play button)
        this.Graphics.fillStyle = btn.textColor;
        this.Graphics.font = "16px Arial";
        this.Graphics.textAlign = "center";
        this.Graphics.textBaseline = "middle";
        (btn.shape === "play") ? this.Graphics.fillText(btn.label, cx - 25, cy) : this.Graphics.fillText(btn.label, cx, cy);

        this.Graphics.restore();
    }

    redraw() {
        this.clear();
        // draw shapes first (lower z), then buttons by z ascending
        const all = [
            ...this.shapes.map(s => ({ ...s, kind: "shape" })),
            ...this.buttons.map(b => ({ ...b, kind: "button" }))
        ];
        all.sort((a, b) => (a.z || 0) - (b.z || 0));

        all.forEach(item => {
            if (item.kind === "shape") this.drawShape(item);
            else this.drawButton(item);
        });
    }

    draw(shape, ...args) {
        if (this.Shapes[shape]) {
            this.Shapes[shape](...args);
        }
    }

    Shapes = {
        Square: (w, h, x, y, color) => {
            this.Graphics.fillStyle = color;
            this.Graphics.fillRect(x, y, w, h);
        },
        Circle: (r, x, y, color) => {
            this.Graphics.fillStyle = color;
            this.Graphics.beginPath();
            this.Graphics.arc(x, y, r, 0, Math.PI * 2);
            this.Graphics.fill();
        },
        Text: (text, x, y, color, font = "16px Arial") => {
            this.Graphics.fillStyle = color;
            this.Graphics.font = font;
            this.Graphics.textAlign = "left";      // reset to default
            this.Graphics.textBaseline = "alphabetic"; // reset to default
            this.Graphics.fillText(text, x, y);
        },
        Button: (...args) => {
            // do not draw directly; route to addButton so state is correct
            this.addButton(...args);
        },
        Image: (img, x, y, w, h) => {
            // Draw the image once it’s loaded
            if (img.complete) {
                this.Graphics.drawImage(img, x, y, w, h);
            } else {
                img.onload = () => {
                    this.Graphics.drawImage(img, x, y, w, h);
                };
            }
        },
    };
}

class SXMLParser {
    constructor(stage) {
        this.stage = stage;
        if (!this.stage.sprites) this.stage.sprites = []; // ensure sprites array exists
    }

    parse(sxmlString) {
        console.log("Parsing SXML...");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sxmlString, "application/xml");
        console.log("SXML parsed.");

        // Circles
        xmlDoc.querySelectorAll("circle").forEach(node => {
            this.stage.addShape("Circle", {
                r: Number(node.getAttribute("radius")),
                x: Number(node.getAttribute("x")),
                y: Number(node.getAttribute("y")),
                color: node.getAttribute("color")
            }, Number(node.getAttribute("z")) || 0);
        });

        // Squares
        xmlDoc.querySelectorAll("square").forEach(node => {
            this.stage.addShape("Square", {
                w: Number(node.getAttribute("width")),
                h: Number(node.getAttribute("height")),
                x: Number(node.getAttribute("x")),
                y: Number(node.getAttribute("y")),
                color: node.getAttribute("color")
            }, Number(node.getAttribute("z")) || 0);
        });

        // Text
        xmlDoc.querySelectorAll("text").forEach(node => {
            this.stage.addShape("Text", {
                text: node.textContent,
                x: Number(node.getAttribute("x")),
                y: Number(node.getAttribute("y")),
                color: node.getAttribute("color"),
                font: node.getAttribute("font")
            }, Number(node.getAttribute("z")) || 0);
        });

        // Scripts
        xmlDoc.querySelectorAll("script").forEach(node => {
            new CocoScriptEngine().run(node.textContent);
        });

        xmlDoc.querySelectorAll("JavaScript").forEach(node => {
            window.eval(node.textContent);
        });

        // Buttons
        xmlDoc.querySelectorAll("button").forEach(node => {
            this.stage.addButton(
                node.textContent.trim(),
                Number(node.getAttribute("x")),
                Number(node.getAttribute("y")),
                Number(node.getAttribute("width")),
                Number(node.getAttribute("height")),
                node.getAttribute("bgColor") || "lightgray",
                node.getAttribute("textColor") || "black",
                node.getAttribute("onclick"),
                node.getAttribute("onclickJS"),
                Number(node.getAttribute("z")) || 0,
                node.getAttribute("type") || "rect"
            );
        });

        // Links
        xmlDoc.querySelectorAll("link").forEach(node => {
            const x = Number(node.getAttribute("x"));
            const y = Number(node.getAttribute("y"));
            const text = node.textContent.trim();
            this.stage.addShape("Text", {
                text,
                x,
                y,
                color: "blue",
                font: "16px Arial"
            });
            this.stage.addButton(
                text,
                x,
                y - 10,
                text.length * 10,
                20,
                "transparent",
                "blue",
                `window.open('${node.getAttribute("url")}','_blank')`
            );
        });

        // Images
        xmlDoc.querySelectorAll("img").forEach(node => {
            const src = node.getAttribute("src");
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.stage.addShape("Image", {
                    img,
                    x: Number(node.getAttribute("x")) || 0,
                    y: Number(node.getAttribute("y")) || 0,
                    w: Number(node.getAttribute("width")) || img.width,
                    h: Number(node.getAttribute("height")) || img.height
                }, Number(node.getAttribute("z")) || 0);
            };
        });

        /*

        // Sprites
        xmlDoc.querySelectorAll("Sprite").forEach(node => {
            const id = node.getAttribute("id");
            const skins = [];
            node.querySelectorAll("img").forEach(imgNode => {
                skins.push({ name: imgNode.getAttribute("name"), src: imgNode.getAttribute("src") });
            });
            this.stage.sprites.push({ id, skins, current: skins[0] });
        });

        // This is causing a stack overflow error.

        /*
        // Div containers (just recurse into children)
        xmlDoc.querySelectorAll("div").forEach(divNode => {
            this.parse(divNode.innerHTML);
        });
        */
    }
}

class CocoScriptEngine {
    constructor() {
        this.env = {}; // variable storage
        window.diplay = {
            print: (msg) => {
                console.log(msg);
            },
            Stage: new Stage()
        };

    }

    run(code) {
        // remove comments
        code = code.replace(/\/\/.*$/gm, '');
        // normalize whitespace
        const tokens = code.split('\n').map(l => l.trim()).filter(l => l.length);
        // join back for block parsing
        this.executeBlocks(tokens.join('\n'));
    }

    executeBlocks(code) {
        let i = 0;
        while (i < code.length) {
            if (code[i] === '?') {
                // collect the chain
                const chain = [];
                let condEnd = code.indexOf('{', i);
                let condition = code.slice(i + 1, condEnd).trim();
                let {
                    block,
                    endIndex
                } = this.extractBlock(code, condEnd);
                chain.push({
                    condition,
                    block
                });
                i = endIndex + 1;

                // collect following not-blocks
                while (code.startsWith('else', i)) {
                    let condStart = i + 3;
                    let condEnd = code.indexOf('{', condStart);
                    let condition = code.slice(condStart, condEnd).trim();
                    if (condition.startsWith('?')) condition = condition.slice(1).trim();
                    let {
                        block,
                        endIndex
                    } = this.extractBlock(code, condEnd);
                    chain.push({
                        condition: condition || null,
                        block
                    });
                    i = endIndex + 1;
                }

                // evaluate chain
                let executed = false;
                for (let branch of chain) {
                    if (executed) break;
                    if (branch.condition) {
                        if (this.evalValue(branch.condition)) {
                            this.run(branch.block);
                            executed = true;
                        }
                    } else {
                        // plain else
                        this.run(branch.block);
                        executed = true;
                    }
                }

                // IMPORTANT: continue to next iteration, don’t re‑parse the chain
                continue;
            } else {
                // normal line
                const nextLine = code.indexOf('\n', i);
                const line = code.slice(i, nextLine === -1 ? code.length : nextLine).trim();
                if (line) this.execute(line);
                i = nextLine === -1 ? code.length : nextLine + 1;
            }
        }
    }

    execute(line) {
        if (line.startsWith('style')) {
            const match = line.match(/style\(([^,]+),([^,]+),([^)]+)\)/);
            if (match) {
                const selector = match[1].trim().replace(/['"]/g, "");
                const property = match[2].trim().replace(/['"]/g, "");
                const value = match[3].trim().replace(/['"]/g, "");
                this.style(selector, property, value);
            }
        } else if (line.startsWith('!')) {
            const parts = line.replace(';', '').split(/\s*=\s*/);
            if (parts.length === 2) {
                const name = parts[0].slice(1);
                const value = parts[1];
                this.env[name] = this.evalValue(value);
            }
        } else if (/^\w+\s*=/.test(line)) {
            const parts = line.replace(';', '').split(/\s*=\s*/);
            if (parts.length === 2) {
                const name = parts[0];
                const value = parts[1];
                this.env[name] = this.evalValue(value);
            }
        } else if (line.startsWith('diplay')) {
            const match = line.match(/\((.*)\)/);
            if (match) {
                const inside = match[1];
                const val = this.evalValue(inside);
                console.log(val);

                const output = window.document.getElementById("CocoScript's-special-output");
                if (output) {
                    output.innerHTML =
                        `<li class="CocoScript's-special-output-item">${val}</li>` + output.innerHTML;
                }
            }
        } else if (line.startsWith('draw')) {
            const match = line.match(/draw\(([^)]+)\)/);
            if (match) {
                const args = match[1].split(',').map(a => a.trim().replace(/['"]/g, ""));
                const shape = args[0];
                if (stage.Shapes[shape]) {
                    stage.Shapes[shape](...args.slice(1));
                }
            }
        }

    }

    evalValue(val) {
        if (val === undefined || val === null) return undefined;
        val = val.trim();

        if (val === 'true') return true;
        if (val === 'false') return false;
        if (!isNaN(val)) return Number(val);
        if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);

        // Handle logical AND
        if (val.includes('&&')) {
            const parts = val.split('&&').map(s => s.trim());
            return parts.every(expr => this.evalValue(expr));
        }

        // Handle logical OR
        if (val.includes('||')) {
            const parts = val.split('||').map(s => s.trim());
            return parts.some(expr => this.evalValue(expr));
        }

        // Handle comparisons
        if (val.includes('==')) {
            const [left, right] = val.split('==').map(s => s.trim());
            return this.evalValue(left) == this.evalValue(right);
        }
        if (val.includes('!=')) {
            const [left, right] = val.split('!=').map(s => s.trim());
            return this.evalValue(left) != this.evalValue(right);
        }
        if (val.includes('>')) {
            const [left, right] = val.split('>').map(s => s.trim());
            return this.evalValue(left) > this.evalValue(right);
        }
        if (val.includes('<')) {
            const [left, right] = val.split('<').map(s => s.trim());
            return this.evalValue(left) < this.evalValue(right);
        }

        // variable lookup
        return this.env[val];
    }

    extractBlock(code, startIndex) {
        let depth = 0;
        let block = '';
        for (let i = startIndex; i < code.length; i++) {
            const ch = code[i];
            if (ch === '{') {
                depth++;
                if (depth > 1) block += ch;
            } else if (ch === '}') {
                depth--;
                if (depth === 0) return {
                    block: block.trim(),
                    endIndex: i
                };
                else block += ch;
            } else {
                if (depth > 0) block += ch;
            }
        }
        return null; // unmatched braces
    }

    style(selector, property, value) {
        let styleTag = document.getElementById("coco-style");
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "coco-style";
            document.head.appendChild(styleTag);
        }

        if (property === "background-img") {
            styleTag.textContent += `${selector} { background-image: url("${value}") !important; }\n`;
        } else {
            styleTag.textContent += `${selector} { ${property}: ${value} !important; }\n`;
        }
    }


}

if (isTest) {
    const CocoScript = new CocoScriptEngine();
    const SXMLRuntime = new SXMLParser(diplay.Stage);
    fetch("test.sxml")
        .then(res => res.text())
        .then(sxml => SXMLRuntime.parse(sxml));
}