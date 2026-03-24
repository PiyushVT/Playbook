import Main from "./Main.js";

export default class Input {
    constructor(player) {
        this.main = new Main();
        this.canvas = this.main.canvas;

        this.player = player;

        this.isDown = false;
        this.lastX = 0;

        this.bind();
    }

    bind() {
        window.addEventListener("pointerdown", this.onDown);
        window.addEventListener("pointermove", this.onMove);
        window.addEventListener("pointerup", this.onUp);
        window.addEventListener("pointercancel", this.onUp);
    }

    onDown = (e) => {
        this.isDown = true;
        this.lastX = e.clientX;
        this.player.isDragging = true;
    };

    onMove = (e) => {
        if (!this.isDown) return;

        const dx = e.clientX - this.lastX;
        this.lastX = e.clientX;

        this.player.onDrag(dx);
    };

    onUp = () => {
        this.isDown = false;
        this.player.isDragging = false;
    };

    destroy() {
        this.canvas.removeEventListener("pointerdown", this.onDown);
        this.canvas.removeEventListener("pointermove", this.onMove);
        window.removeEventListener("pointerup", this.onUp);
        window.removeEventListener("pointercancel", this.onUp);
    }
}
