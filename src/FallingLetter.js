import { GAME_CONFIG } from "../configs/GameConfig.js";
import Main from "./Main.js";

export default class FallingLetter {
    constructor(letter, x, y, fallDuration, wordManager) {
        this.main = new Main();
        this.ctx = this.main.ctx;
        this.assets = this.main.assets.spritesheet;

        this.playerController = this.main.playerController;

        this.letter = letter.toUpperCase();
        this.wordManager = wordManager;

        this.x = x;
        this.startY = y;
        this.y = y;

        this.fallDuration = fallDuration;
        this.elapsed = 0;
        this.endY = this.playerController.y + this.playerController.h + 100;

        this.dead = false;
        
        this.flying = false;
        this.flyTimer = 0;
        this.flyDuration = 0;
        
        this.hiding = false;
        this.hideTimer = 0;
        this.opacity = 1;
        this.hideConfig = GAME_CONFIG.letters.hideAnimation;
    }

    update(dt) {
        if (this.flying) {
            this.flyTimer += dt;
            const t = Math.min(this.flyTimer / this.flyDuration, 1);
            
            // Linear interpolation
            this.x = this.flyStartX + (this.flyTargetX - this.flyStartX) * t;
            this.y = this.flyStartY + (this.flyTargetY - this.flyStartY) * t;
            this.currentSize = this.flyStartSize + (this.flyTargetSize - this.flyStartSize) * t;

            if (t >= 1) {
                this.wordManager.onCollected(this.letter);
                this.dead = true;
            }
            return;
        }

        if (this.hiding) {
            this.hideTimer += dt;
            const duration = this.hideConfig.duration;
            
            if (this.hideTimer >= duration) {
                this.dead = true;
                return;
            }
            
            this.opacity = Math.max(0, 1 - (this.hideTimer / duration));
            
            const fallSpeed = (this.endY - this.startY) / this.fallDuration;
            this.y += fallSpeed * dt;
            
            return;
        }

        this.elapsed += dt;
        const t = Math.min(this.elapsed / this.fallDuration, 1);

        this.y = this.startY + (this.endY - this.startY) * t;

        const letterBounds = this.getBounds();
        const basketBounds = this.playerController.getBounds();

        if (intersects(letterBounds, basketBounds)) {
            this.collect();
            return;
        }

        if (this.y > this.playerController.y + this.playerController.h) {
            this.wordManager.onMissed(this.letter, this.x, this.y);
            this.hiding = true;
            return;
        }

        if (t >= 1) {
            this.hiding = true;
        }
    }

    getSize() {
        if (this.main.laneSpawner && this.main.laneSpawner.lanes.length > 0) {
            return this.main.laneSpawner.lanes[0].w * GAME_CONFIG.letters.fontSize;
        }
    }

    draw() {
        const SPRITE_SIZE = 131;

        const START_X = 10;
        const START_Y = 8;

        const GAP_X = 4;
        const GAP_Y = 4;

        const STRIDE_X = SPRITE_SIZE + GAP_X;
        const STRIDE_Y = SPRITE_SIZE + GAP_Y;

        const COLS = 5;

        const index = this.letter.charCodeAt(0) - 65; 
        if (index < 0 || index > 25) return;

        const col = index % COLS;
        const row = Math.floor(index / COLS);

        const sx = START_X + col * STRIDE_X;
        const sy = START_Y + row * STRIDE_Y;

        const drawSize = (this.flying && this.currentSize) ? this.currentSize : this.getSize();

        this.ctx.globalAlpha = this.opacity;
        this.ctx.drawImage(
            this.assets,
            sx,
            sy,
            SPRITE_SIZE,
            SPRITE_SIZE,
            this.x - drawSize / 2,
            this.y,
            drawSize,
            drawSize
        );
        this.ctx.globalAlpha = 1;
    }

    collect() {
        if (this.hiding || this.flying) return;
        
        const status = this.wordManager.checkStatus(this.letter);

        if (status.isCorrect && status.isNeeded) {
            // Try to get target UI element
            const uiTarget = this.main.uiManager && this.main.uiManager.wordDisplay 
                ? this.main.uiManager.wordDisplay.getTargetForLetter(this.letter) 
                : null;
            
            if (uiTarget) {
                this.flying = true;
                this.flyTimer = 0;
                this.flyDuration = GAME_CONFIG.letters.flyAnimation.duration;
                
                this.flyStartX = this.x;
                this.flyStartY = this.y;
                this.flyStartSize = this.getSize();
                
                this.flyTargetX = uiTarget.x;
                // Adjust Y because draw() uses top-left (sort of, x is center, y is top)
                // uiTarget.y is center of the box
                this.flyTargetY = uiTarget.y - uiTarget.h / 2;
                this.flyTargetSize = uiTarget.w; 
                
                return;
            }
        }

        this.wordManager.onCollected(this.letter);
        this.dead = true;
    }

    getBounds() {
        const size = this.getSize();
        return {
            x: this.x - size * 0.5,
            y: this.y,
            w: size,
            h: size
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
