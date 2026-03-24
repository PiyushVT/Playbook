import Main from "../Main.js";

export default class MissedManager {
    constructor() {
        this.main = new Main();
        this.ctx = this.main.ctx;
        this.eventEmitter = this.main.eventEmitter;
        this.assets = this.main.assets;

        this.items = [];

        this.spriteX = 220;
        this.spriteY = 764;
        this.spriteW = 317 - 220;
        this.spriteH = 793 - 765;

        this.sprite2X = 146;
        this.sprite2Y = 760;
        this.sprite2W = 216 - 146;
        this.sprite2H = 812 - 760;
        this.sprite2Scale = 0.3;

        this.stackGap = 2;

        this.eventEmitter.on("word.missed", (x, y) => {
            this.spawn(x, y);
        });
    }

    spawn(x, y) {
        let laneWidth = 100;
        if (this.main.laneSpawner && this.main.laneSpawner.lanes.length > 0) {
            laneWidth = this.main.laneSpawner.lanes[0].w;
        }

        const scale = laneWidth / this.spriteW;
        const w = laneWidth;
        const h = this.spriteH * scale;

        this.items.push({
            x: x,
            y: y,
            w: w,
            h: h,
            opacity: 1,
            life: 1.0, 
            offsetY: 0
        });
    }

    update(dt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.life -= dt;

            if (item.life < 0.3) {
                item.opacity = item.life / 0.3;
            }

            if (item.life <= 0) {
                this.items.splice(i, 1);
            }
        }
    }

    draw() {
        if (this.items.length === 0) return;

        const image = this.assets.spritesheet;
        if (!image) return;

        this.ctx.save();
        for (const item of this.items) {
            this.ctx.globalAlpha = item.opacity;
            
            const drawX = item.x - item.w / 2;
            const drawY = (item.y + item.offsetY) - item.h;

            this.ctx.drawImage(
                image,
                this.spriteX, this.spriteY, this.spriteW, this.spriteH,
                drawX, drawY, item.w, item.h
            );

            // Draw second sprite
            const scale = item.w / this.spriteW;
            const finalScale = scale * this.sprite2Scale;
            
            const w2 = this.sprite2W * finalScale;
            const h2 = this.sprite2H * finalScale;

            const drawX2 = item.x - w2 / 2;
            const drawY2 = drawY + item.h + (this.stackGap * scale);

            this.ctx.drawImage(
                image,
                this.sprite2X, this.sprite2Y, this.sprite2W, this.sprite2H,
                drawX2, drawY2, w2, h2
            );
        }
        this.ctx.restore();
    }
}
