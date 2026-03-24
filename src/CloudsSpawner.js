import Main from "./Main.js";
import { GAME_CONFIG } from "../configs/GameConfig.js";

export default class CloudsSpawner {
    constructor() {
        this.main = new Main();
        this.sizes = this.main.sizes;
        this.assets = this.main.assets;
        this.ctx = this.main.ctx;
        this.cloudImage = this.assets.cloud;

        this.laneCount = GAME_CONFIG.lanes.laneCount;
        this.laneWidthRatio = GAME_CONFIG.lanes.laneWidthRatio;
        this.playZoneWidthRatio = GAME_CONFIG.lanes.playZoneWidthRatio;
        this.playZoneTopRatio = GAME_CONFIG.lanes.playZoneTopRatio;
        this.cloudOffsetY = GAME_CONFIG.clouds.cloudOffsetY;
        this.scaleConfig = GAME_CONFIG.clouds.scaleAnimation;

        this.clouds = [];

        this.resize(this.sizes.width, this.sizes.height);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        this.clouds.length = 0;

        const playZoneWidth = Math.min(
            width,
            height * this.playZoneWidthRatio
        );

        const cellWidth = playZoneWidth / this.laneCount;
        const laneWidth = cellWidth * this.laneWidthRatio;

        const laneSpacing =
            (playZoneWidth - this.laneCount * laneWidth) /
            (this.laneCount + 1);

        const totalWidth =
            this.laneCount * laneWidth +
            (this.laneCount - 1) * laneSpacing;

        const startX = (width - totalWidth) / 2;

        const cloudScale = GAME_CONFIG.clouds.cloudScale;
        const ratio = this.cloudImage.width / this.cloudImage.height;

        const baseY = height * this.playZoneTopRatio + this.cloudOffsetY;
        const alternateOffset = GAME_CONFIG.clouds.cloudAlternateOffset;

        for (let i = 0; i < this.laneCount; i++) {
            const x = startX + i * (laneWidth + laneSpacing);

            const cloudW = laneWidth * cloudScale;
            const cloudH = cloudW / ratio;

            const cloudX = x + (laneWidth - cloudW) / 2;

            // ↓ start DOWN, then alternate
            const direction = i % 2 === 0 ? 1 : -1;
            const y = baseY + direction * alternateOffset;

            this.clouds.push({
                x: cloudX,
                y,
                w: cloudW,
                h: cloudH,
                baseW: cloudW,
                baseH: cloudH,
                scale: 1,
                animating: false,
                timer: 0
            });
        }
    }

    triggerAnimation(index) {
        if (this.clouds[index]) {
            this.clouds[index].animating = true;
            this.clouds[index].timer = 0;
        }
    }

    update(dt) {
        for (const cloud of this.clouds) {
            if (cloud.animating) {
                cloud.timer += dt;
                const duration = this.scaleConfig.duration;
                
                if (cloud.timer >= duration) {
                    cloud.animating = false;
                    cloud.scale = 1;
                } else {
                    // Scale up then down: 1 -> max -> 1
                    // Sine wave: sin(0..PI) goes 0->1->0
                    // scale = 1 + (max - 1) * sin(...)
                    const progress = cloud.timer / duration;
                    const sinVal = Math.sin(progress * Math.PI);
                    const maxScale = this.scaleConfig.scaleUp;
                    cloud.scale = 1 + (maxScale - 1) * sinVal;
                }
            }
        }
    }

    draw() {
        if (!this.cloudImage) return;

        for (const cloud of this.clouds) {
            const w = cloud.baseW * cloud.scale;
            const h = cloud.baseH * cloud.scale;
            const x = cloud.x + (cloud.baseW - w) / 2;
            const y = cloud.y + (cloud.baseH - h) / 2;

            this.ctx.drawImage(
                this.cloudImage,
                x,
                y,
                w,
                h
            );
        }
    }
}
