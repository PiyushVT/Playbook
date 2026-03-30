import { ASSETS } from "../sources.js";
import Loader from "./utils/Loader.js";
import LaneSpawner from "./LaneSpawner.js";
import CloudsSpawner from "./CloudsSpawner.js";
import PlayerController from "./PlayerController.js";
import Input from "./Input.js";
import WordLoader from "./WordLoader.js";
import WordManager from "./Managers/WordManager.js";
import SpawnManager from "./Managers/SpawnManager.js";
import DifficultyManager from "./Managers/DifficultyManager.js";
import MissedManager from "./Managers/MissedManager.js";
import EventEmitter from "./utils/EventEmitter.js";
import UIManager from "./Managers/UIManager.js";
import FeedbackManager from "./Managers/FeedbackManager.js";
import CoinManager from "./Managers/CoinManager.js";

let instance = null;

export default class Main {
    constructor(canvas, ctx) {
        if (instance) {
            return instance
        }
        instance = this
        window.main = this
        this.canvas = canvas;
        this.ctx = ctx;
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.on('game.over', () => {
            console.log('[Game] Game Over');
            this.state = 'over';
        });

        this.sizes = {
            width: 0,
            height: 0,
            scale: 1
        };

        const now = Date.now();
        this.time = {
            start: now,
            current: now,
            elapsed: 0,
            delta: 0
        };

        this.state = 'loading';
        this.assets = null;
        
        this._assetsReady = false;
        this._startRequested = false;

        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        this.addEventListeners();
        this.resize();

        this.loader = new Loader(ASSETS);
        this.loader.load().then(items => {
            this.assets = items;
            this.cloudsSpawner = new CloudsSpawner();
            this.laneSpawner = new LaneSpawner();
            this.playerController = new PlayerController();
            this.input = new Input(this.playerController);

            this.wordLoader = new WordLoader();
            this.uiManager = new UIManager();
            this.uiManager.init();
            this.wordManager = new WordManager(this.wordLoader);
            this.wordManager.start();
            this.difficultyManager = new DifficultyManager(this.wordManager);
            this.spawnManager = new SpawnManager(
                this.difficultyManager,
                this.wordManager,
                this.sizes,
                this.cloudsSpawner
            );
            this.missedManager = new MissedManager();
            this.feedbackManager = new FeedbackManager();
            this.coinManager = new CoinManager();
            this.state = 'loaded';
            this._assetsReady = true;

            if (this._startRequested) {
                this._beginGameplay();
            }
        });

        requestAnimationFrame(this.loop);
    }

    start() {
        if (this._assetsReady) {
            this._beginGameplay();
        } else {
            this._startRequested = true;
        }
    }

    _beginGameplay() {
        if (this.state === 'run') return;
        this.state = 'run';
    }

    addEventListeners() {
        window.addEventListener('resize', this.resize);
        window.addEventListener('orientationchange', this.resize);
    }

    removeEventListeners() {
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('orientationchange', this.resize);
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.sizes.width = rect.width;
        this.sizes.height = rect.height;
        this.sizes.scale = dpr;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (this.laneSpawner) {
            this.laneSpawner.resize(this.sizes.width, this.sizes.height);
        }
        if (this.cloudsSpawner) {
            this.cloudsSpawner.resize(this.sizes.width, this.sizes.height);
        }
        if (this.playerController) {
            this.playerController.resize(this.sizes.width, this.sizes.height);
        }
    }

    loop() {
        const now = Date.now();

        this.time.delta = (now - this.time.current) / 1000;
        this.time.current = now;
        this.time.elapsed = (now - this.time.start) / 1000;

        const dt = Math.min(this.time.delta, 0.1);

        if (this.state === 'run') {
            this.update(dt);
        }

        this.render();
        requestAnimationFrame(this.loop);
    }

    update(dt) {
        if (this.spawnManager) this.spawnManager.update(dt);
        if (this.cloudsSpawner) this.cloudsSpawner.update(dt);
        if (this.playerController) this.playerController.update(dt);
        if (this.missedManager) this.missedManager.update(dt);
        if (this.feedbackManager) this.feedbackManager.update(dt);
    }

    render() {
        const { width, height } = this.sizes;

        this.ctx.setTransform(this.sizes.scale, 0, 0, this.sizes.scale, 0, 0);
        this.ctx.clearRect(0, 0, width, height);

        if (this.state === 'loading' || this.state === 'loaded') {
            this.renderLoading();
            return;
        }

        if (this.laneSpawner) {
            this.laneSpawner.draw();
        }
        if (this.spawnManager) {
            this.spawnManager.draw();
        }
        if (this.cloudsSpawner) {
            this.cloudsSpawner.draw();
        }
        if (this.playerController) {
            this.playerController.draw();
        }
        if (this.missedManager) {
            this.missedManager.draw();
        }
        if (this.feedbackManager) {
            this.feedbackManager.draw();
        }
    }
                                                                       
    renderLoading() {
        const { ctx, sizes } = this;

        ctx.fillStyle = '#ff0000ff';
        ctx.fillRect(0, 0, sizes.width, sizes.height);

        ctx.fillStyle = '#fff';
        ctx.fillRect(
            40,
            sizes.height / 2,
            (sizes.width - 80) * this.loader.progress(),
            6
        );
    }

    destroy() {
        this.removeEventListeners();
    }
}
