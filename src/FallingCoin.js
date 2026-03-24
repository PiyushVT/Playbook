import { GAME_CONFIG } from "../configs/GameConfig.js";
import Main from "./Main.js";

export default class FallingCoin {
    constructor(x, y, fallDuration) {
        this.main = new Main();
        this.ctx = this.main.ctx;
        this.assets = this.main.assets.spritesheet;
        this.playerController = this.main.playerController;

        this.x = x;
        this.startY = y;
        this.y = y;

        this.fallDuration = fallDuration;
        this.elapsed = 0;
        this.endY = this.playerController.y + this.playerController.h + 100;

        this.dead = false;

        this.hiding = false;
        this.hideTimer = 0;
        this.opacity = 1;
        this.hideDuration = 0.3;
    }

    update(dt) {
        if (this.hiding) {
            this.hideTimer += dt;

            if (this.hideTimer >= this.hideDuration) {
                this.dead = true;
                return;
            }

            this.opacity = Math.max(0, 1 - this.hideTimer / this.hideDuration);
            this.y += ((this.endY - this.startY) / this.fallDuration) * dt;
            return;
        }

        this.elapsed += dt;
        const t = Math.min(this.elapsed / this.fallDuration, 1);
        this.y = this.startY + (this.endY - this.startY) * t;

        const coinBounds = this.getBounds();
        const basketBounds = this.playerController.getBounds();

        if (intersects(coinBounds, basketBounds)) {
            this.collect();
            return;
        }

        if (t >= 1) {
            this.hiding = true;
        }
    }

    getBgSize() {
        if (this.main.laneSpawner && this.main.laneSpawner.lanes.length > 0) {
            return this.main.laneSpawner.lanes[0].w * GAME_CONFIG.coins.bgWidthRatio;
        }
        return 40;
    }

    getCoinSize() {
        return this.getBgSize() * GAME_CONFIG.coins.coinSizeRatio;
    }

    draw() {
        // Draw Background
        const bgSize = this.getBgSize();
        const bgSrc = GAME_CONFIG.coins.bgSrc;
        const bgHeight = bgSize * (bgSrc.h / bgSrc.w);

        this.ctx.globalAlpha = this.opacity;

        this.ctx.drawImage(
            this.assets,
            bgSrc.x, bgSrc.y, bgSrc.w, bgSrc.h,
            this.x - bgSize / 2,
            this.y,
            bgSize,
            bgHeight
        );

        // Draw Coin
        const coinWidth = this.getCoinSize();
        const coinSrc = { x: 327, y: 691, w: 59, h: 71 };
        const coinHeight = coinWidth * (coinSrc.h / coinSrc.w);
        
        // Center coin on background
        const coinX = this.x - coinWidth / 2;
        const coinY = this.y + (bgHeight - coinHeight) / 2;

        this.ctx.drawImage(
            this.assets,
            coinSrc.x, coinSrc.y, coinSrc.w, coinSrc.h,
            coinX,
            coinY,
            coinWidth,
            coinHeight
        );

        this.ctx.globalAlpha = 1;
    }


    collect() {
        if (this.hiding) return;

        // Hide immediately on collect
        this.dead = true; 
        this.main.eventEmitter.trigger('coin.collected');
    }

    getBounds() {
        const size = this.getBgSize();
        const bgSrc = GAME_CONFIG.coins.bgSrc;
        const height = size * (bgSrc.h / bgSrc.w);
        
        return {
            x: this.x - size * 0.5,
            y: this.y,
            w: size,
            h: height
        };
    }
}

function intersects(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}
