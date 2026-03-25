import Main from "./Main.js";
import { GAME_CONFIG } from "../configs/GameConfig.js";

export default class PlayerController {
    constructor() {
        this.main = new Main();
        this.eventEmitter = this.main.eventEmitter;  
        this.sizes = this.main.sizes;
        this.assets = this.main.assets;
        this.ctx = this.main.ctx;
        this.laneSpawner = this.main.laneSpawner;
        // Asset
        this.basketImage = this.assets.basket;
        this.handImage = this.assets.hand;

        // Movement config
        this.laneCount = GAME_CONFIG.lanes.laneCount;
        this.laneWidthRatio = GAME_CONFIG.lanes.laneWidthRatio;
        this.playZoneWidthRatio = GAME_CONFIG.lanes.playZoneWidthRatio;

        this.maxTiltAngle = GAME_CONFIG.player.maxTiltAngle;
        this.tiltSpeedAmplitude = GAME_CONFIG.player.tiltSpeedAmplitude;
        this.tiltSmoothness = GAME_CONFIG.player.tiltSmoothness;

        this.globalSpeedMultiplier = GAME_CONFIG.player.globalSpeedMultiplier;
        this.idleAmplitude = GAME_CONFIG.player.idleAmplitude;
        this.idleFrequency = GAME_CONFIG.player.idleFrequency;
        this.idleSmoothness = GAME_CONFIG.player.idleSmoothness;

        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;

        this.targetX = 0;
        this.lastX = 0;
        this.velocityX = 0;
        this.currentTilt = 0;

        this.isDragging = false;
        this.isDragInverted = false;

        this.idleOffsetY = 0;
        
        this.state = 'Auto';

        this.resize(this.sizes.width, this.sizes.height);

        this.eventEmitter.on('player.dragged', () => {
            if (this.state === 'Auto') {
                this.state = 'Manual';
            }
        });
    }

    resize(width, height) {
        const playZoneWidth = Math.min(
            width,
            height * this.playZoneWidthRatio
        );

        const cellWidth = playZoneWidth / this.laneCount;
        const laneWidth = cellWidth * this.laneWidthRatio;

        this.w = laneWidth;

        if (this.basketImage && this.basketImage.naturalWidth) {
            const aspect =
                this.basketImage.naturalHeight / this.basketImage.naturalWidth;
            this.h = this.w * aspect;
        } else {
            this.h = this.w * 0.6;
        }

        if (this.handImage && this.handImage.naturalWidth) {
            const handAspect =
                this.handImage.naturalHeight / this.handImage.naturalWidth;
            this.handH = this.w * handAspect;
        } else {
            this.handH = this.w;
        }

        this.x = (width - this.w) / 2;
        this.y = height * GAME_CONFIG.player.yRatio;

        this.targetX = this.x;
        this.lastX = this.x;

        this.minX = (width - playZoneWidth) / 2;
        this.maxX = this.minX + playZoneWidth - this.w;

        if (this.laneSpawner && this.laneSpawner.lanes.length > 0) {
            this.minX = this.laneSpawner.lanes[0].x;
            this.maxX =
                this.laneSpawner.lanes[
                    this.laneSpawner.lanes.length - 1
                ].x;
        }
    }


    onDrag(deltaX) {
        this.isDragging = true;

        if (this.isDragInverted) deltaX *= -1;

        this.targetX += deltaX;
        this.targetX = Math.max(this.minX, Math.min(this.targetX, this.maxX));
    }

    update(dt) {
        this.handleMovement(dt);
        this.handleTilt(dt);
        this.handleIdle(dt);

        this.lastX = this.x;
    }

    handleMovement(dt) {
        if (this.state === 'Auto') {
            const t = performance.now() * 0.002;
            const amplitude = (this.maxX - this.minX) / 2;
            const centerX = this.minX + amplitude;
            this.targetX = centerX + Math.sin(t) * amplitude;
        }

        const speed =
            this.globalSpeedMultiplier * 1000 * dt;

        this.x += (this.targetX - this.x) * speed * dt;
    }

    handleTilt(dt) {
        const dx = this.x - this.lastX;
        const velocityX = dx / dt;

        const targetTilt = Math.max(
            -this.maxTiltAngle,
            Math.min(
                velocityX * this.tiltSpeedAmplitude,
                this.maxTiltAngle
            )
        );

        this.currentTilt +=
            (targetTilt - this.currentTilt) * dt * this.tiltSmoothness;
    }

    handleIdle(dt) {
        if (this.isDragging) return;

        const t = performance.now() * 0.001;
        const targetIdleY =
            Math.sin(t * this.idleFrequency) * this.idleAmplitude;

        this.idleOffsetY +=
            (targetIdleY - this.idleOffsetY) * dt * this.idleSmoothness;
    }

    draw() {
        if (!this.basketImage) return;

        this.ctx.save();

        this.ctx.translate(
            this.x + this.w / 2,
            this.y + this.h / 2 + this.idleOffsetY
        );

        this.ctx.save();
        this.ctx.rotate((this.currentTilt * Math.PI) / 180);

        this.ctx.drawImage(
            this.basketImage,
            -this.w / 2,
            -this.h / 2,
            this.w,
            this.h
        );
        this.ctx.restore();

        if (this.state === 'Auto' && this.handImage) {
            this.ctx.save();
            const scale = 1 + Math.sin(performance.now() * 0.005) * 0.1;
            const cx = this.w / 2;
            const cy = this.handH / 3;

            this.ctx.translate(cx, cy);
            this.ctx.scale(scale, scale);
            this.ctx.rotate(-30 * Math.PI / 180);

            this.ctx.drawImage(
                this.handImage,
                -this.w / 2,
                -this.handH / 2,
                this.w,
                this.handH
            );
            this.ctx.restore();
        }

        this.ctx.restore();
    }

    reset() {
        this.x = this.targetX = this.lastX;
        this.currentTilt = 0;
        this.idleOffsetY = 0;
        this.isDragging = false;
        this.isDragInverted = false;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y + this.idleOffsetY,
            w: this.w,
            h: this.h
        };
    }

}
