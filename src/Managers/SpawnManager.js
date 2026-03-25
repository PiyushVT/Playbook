import FallingLetter from "../FallingLetter.js";
import { GAME_CONFIG } from "../../configs/GameConfig.js";
import Main from "../Main.js";
import FallingCoin from "../FallingCoin.js";

export default class SpawnManager {
    constructor(difficultyManager, wordManager, sizes, cloudsSpawner) {
        this.main = new Main();
        this.eventEmitter = this.main.eventEmitter;  
        this.ctx = this.main.ctx;

        this.difficultyManager = difficultyManager;
        this.wordManager = wordManager;
        this.sizes = sizes;
        this.cloudsSpawner = cloudsSpawner;

        this.letters = [];
        this.timer = 0;
        this.interval = GAME_CONFIG.spawning.interval;

        this.recentLetters = [];
        this.maxRecentLetters = 5;

        this.laneWeights = [];
        this.laneWeightDecay = 0.5;

        this.coinChance = GAME_CONFIG.spawning.coinChance;

        this.canSpawn = false;
        this.popupShown = false;

        this.eventEmitter.on('player.dragged', () => {
            this.startSpawning();
        });
    }

    startSpawning() {
        if(this.canSpawn) return;
        this.canSpawn = true;
        this.showPopup();
    }

    showPopup(){
        const popup = document.createElement('div');
        popup.textContent = "How many words you can collect?";
        Object.assign(popup.style, {
            position: 'absolute',
            left: '50%',
            bottom: '25%',
            transform: 'translateX(-50%)',
            fontFamily: "'Fredoka', sans-serif",
            color: 'white',
            fontSize: '32px',
            fontWeight: '900',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: '1000',
            opacity: '0',
            width: '90%',
            textShadow: '4px 4px 8px rgba(0, 0, 0, 1)',
        });

        const root = document.querySelector('.root') || document.body;
        root.appendChild(popup);

        const animation = popup.animate([
            { opacity: 0, transform: 'translate(-50%, 50px)' },
            { opacity: 1, transform: 'translate(-50%, 0)' },
            { opacity: 1, transform: 'translate(-50%, 0)', offset: 0.8 },
            { opacity: 0, transform: 'translate(-50%, -50px)' }
        ], {
            duration: 3500,
            easing: 'ease-out',
            fill: 'forwards'
        });

        animation.onfinish = () => {
            popup.remove();
            this.popupShown = true;
        };
    }

    update(dt) {
        if (!this.canSpawn || !this.popupShown) return;
        this.timer += dt;

        if (this.timer >= this.interval) {
            this.spawn();
            this.timer = 0;
        }

        for (let i = 0; i < this.laneWeights.length; i++) {
            this.laneWeights[i] = Math.max(
                0,
                this.laneWeights[i] - dt * this.laneWeightDecay
            );
        }

        this.letters.forEach(l => l.update(dt));
        this.letters = this.letters.filter(l => !l.dead);
    }

    draw() {
        this.letters.forEach(l => l.draw());
    }

    spawnCoin() {
        const clouds = this.cloudsSpawner.clouds;
        if (!clouds.length) return;

        if (this.laneWeights.length !== clouds.length) {
            this.laneWeights = new Array(clouds.length).fill(0);
        }

        let total = 0;
        const inverse = new Array(clouds.length);

        for (let i = 0; i < clouds.length; i++) {
            inverse[i] = 1 / (1 + this.laneWeights[i]);
            total += inverse[i];
        }

        let r = Math.random() * total;
        let sum = 0;
        let lane = 0;

        for (let i = 0; i < inverse.length; i++) {
            sum += inverse[i];
            if (r <= sum) {
                lane = i;
                break;
            }
        }

        this.laneWeights[lane] += 1;
        this.cloudsSpawner.triggerAnimation(lane);

        const cloud = clouds[lane];
        const x = cloud.x + cloud.w / 2;
        const y = cloud.y + cloud.h / 2;

        this.letters.push(
            new FallingCoin(
                x,
                y,
                GAME_CONFIG.spawning.fallDuration
            )
        );
    }

    spawnLetter() {
        const clouds = this.cloudsSpawner.clouds;
        if (!clouds.length) return;

        if (this.laneWeights.length !== clouds.length) {
            this.laneWeights = new Array(clouds.length).fill(0);
        }

        let letter;
        let safety = 0;
        let foundValid = false;

        while (!foundValid && safety < 100) {
            letter = this.difficultyManager.getNextLetter();

            const canSpawn = this.wordManager.canSpawnLetter(letter);
            const isRecent = this.recentLetters.includes(letter);

            if (canSpawn && !isRecent) {
                foundValid = true;
            }

            safety++;
        }

        if (!foundValid) return;

        this.recentLetters.push(letter);
        if (this.recentLetters.length > this.maxRecentLetters) {
            this.recentLetters.shift();
        }

        let total = 0;
        const inverse = new Array(clouds.length);

        for (let i = 0; i < clouds.length; i++) {
            inverse[i] = 1 / (1 + this.laneWeights[i]);
            total += inverse[i];
        }

        let r = Math.random() * total;
        let sum = 0;
        let chosenIndex = 0;

        for (let i = 0; i < inverse.length; i++) {
            sum += inverse[i];
            if (r <= sum) {
                chosenIndex = i;
                break;
            }
        }

        this.laneWeights[chosenIndex] += 1;
        this.cloudsSpawner.triggerAnimation(chosenIndex);

        const cloud = clouds[chosenIndex];
        const x = cloud.x + cloud.w / 2;
        const y = cloud.y + cloud.h / 2;

        this.letters.push(
            new FallingLetter(
                letter,
                x,
                y,
                GAME_CONFIG.spawning.fallDuration,
                this.wordManager
            )
        );
    }

    spawn() {
        if (Math.random() * 100 < this.coinChance) {
            this.spawnCoin();
        } else {
            this.spawnLetter();
        }
    }

    onWordCompleted() {
        this.recentLetters.length = 0;
        this.laneWeights.length = 0;
    }
}
