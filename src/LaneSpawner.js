import Main from "./Main.js";
import { GAME_CONFIG } from "../configs/GameConfig.js";

export default class LaneSpawner {
    constructor() {
        this.main = new Main();
        this.ctx = this.main.ctx;
        this.cloudsSpawner = this.main.cloudsSpawner;
        this.laneCount = GAME_CONFIG.lanes.laneCount;
        this.laneWidthRatio = GAME_CONFIG.lanes.laneWidthRatio;
        this.laneHeightHighRatio = GAME_CONFIG.lanes.laneHeightHighRatio;
        this.laneHeightLowRatio = GAME_CONFIG.lanes.laneHeightLowRatio;
        this.playZoneWidthRatio = GAME_CONFIG.lanes.playZoneWidthRatio;
        this.playZoneTopRatio = GAME_CONFIG.lanes.playZoneTopRatio;

        this.lanes = [];

        this.resize(this.main.sizes.width, this.main.sizes.height);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        this.lanes.length = 0;

        const clouds = this.cloudsSpawner.clouds;
        if (!clouds || clouds.length === 0) return;

        const playZoneWidth = Math.min(
            width,
            height * this.playZoneWidthRatio
        );

        const cellWidth = playZoneWidth / this.laneCount;
        const laneWidth = cellWidth * this.laneWidthRatio;

        const laneSpacing =
            (playZoneWidth - this.laneCount * laneWidth) /
            (this.laneCount + 1);

        const laneHeightHigh = height * this.laneHeightHighRatio;
        const laneHeightLow = height * this.laneHeightLowRatio;

        const totalWidth =
            this.laneCount * laneWidth +
            (this.laneCount - 1) * laneSpacing;

        const startX = (width - totalWidth) / 2;

        for (let i = 0; i < this.laneCount; i++) {
            const cloud = clouds[i];

            const isLowLane = i % 2 === 0;
            const laneHeight = isLowLane ? laneHeightLow : laneHeightHigh;

            const x = startX + i * (laneWidth + laneSpacing);

            const y = cloud.y + (cloud.h * 0.6);

            this.lanes.push({
                x,
                y,
                w: laneWidth,
                h: laneHeight,
                isLowLane
            });
        }
    }

    draw() {
        this.ctx.save();

        for (const lane of this.lanes) {
            const grad = this.ctx.createLinearGradient(
                0,
                lane.y,
                0,
                lane.y + lane.h
            );

            grad.addColorStop(0, "rgba(30, 38, 108, 0.2)");
            grad.addColorStop(1, "rgba(30, 38, 108, 0)");

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(lane.x, lane.y, lane.w, lane.h);
        }

        this.ctx.restore();
    }
}

