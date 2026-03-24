import Main from "../Main.js";

export default class FeedbackManager {
    constructor() {
        this.main = new Main();
        this.ctx = this.main.ctx;
        this.eventEmitter = this.main.eventEmitter;
        this.assets = this.main.assets;
        this.player = this.main.playerController;

        this.items = [];

        this.sprites = {
            tick: { x: 145, y: 681, w: 91, h: 75 },
            cross: { x: 241, y: 681, w: 73, h: 77 }
        };

        // Listen to events
        this.eventEmitter.on("word.collected", () => this.spawn('tick'));
        this.eventEmitter.on("health.reduce", () => this.spawn('cross'));
    }

    spawn(type) {
        this.items = [];
        this.items.push({
            type: type,
            life: 1.0,      
            maxLife: 1.0,
            opacity: 0
        });
    }

    update(dt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.life -= dt;
            
            const fadeInDuration = 0.2;
            const fadeOutDuration = 0.2;
            const elapsed = item.maxLife - item.life;

            if (elapsed < fadeInDuration) {
                item.opacity = elapsed / fadeInDuration;
            } else if (item.life < fadeOutDuration) {
                item.opacity = item.life / fadeOutDuration;
            } else {
                item.opacity = 1;
            }

            if (item.life <= 0) {
                this.items.splice(i, 1);
            }
        }
    }

    draw() {
        if (this.items.length === 0) return;
        if (!this.player) {
            this.player = this.main.playerController; 
            if (!this.player) return;
        }

        const image = this.assets.spritesheet;
        if (!image) return;

        const { x, y, w, h, currentTilt, idleOffsetY } = this.player;
        
        this.ctx.save();
        
        this.ctx.translate(
            x + w / 2,
            y + h / 2 + idleOffsetY
        );
        this.ctx.rotate((currentTilt * Math.PI) / 180);
        
        const targetWidth = w * 0.5;

        for (const item of this.items) {
            const sprite = this.sprites[item.type];
            
            const scale = targetWidth / sprite.w;
            const targetHeight = sprite.h * scale;

            this.ctx.globalAlpha = item.opacity;
            
            const drawY = -h / 2 - targetHeight - 20; // 20px padding
            const drawX = -targetWidth / 2;

            this.ctx.drawImage(
                image,
                sprite.x, sprite.y, sprite.w, sprite.h,
                drawX, drawY, targetWidth, targetHeight
            );
        }

        this.ctx.restore();
    }
}
