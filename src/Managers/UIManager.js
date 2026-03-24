import Main from "../Main.js";
import HealthBarManager from "./HealthBarManager.js";
import WordDisplayManager from "./WordDisplayManager.js";
import GameOverManager from "./GameOverManager.js";

export default class UIManager {
    constructor() {
        this.main = new Main();
        this.eventEmitter = this.main.eventEmitter;
        this.healthBar = new HealthBarManager();
        this.wordDisplay = new WordDisplayManager();
        this.gameOverManager = new GameOverManager();
        this.badge = document.querySelector('.badge');
        this.coinValue = document.querySelector('.coin-value');
    }

    init() {
        // Initialize data-text attribute for coin value
        if (this.coinValue) {
            this.coinValue.setAttribute('data-text', this.coinValue.textContent);
        }

        this.healthBar.init();
        this.gameOverManager.init();
        
        this.eventEmitter.on("health.reduce", (amount = 1) => {
            this.healthBar.reduce(amount);
        });

        this.eventEmitter.on("coin.update", (count) => {
            if (this.coinValue) {
                this.coinValue.textContent = count;
                this.coinValue.setAttribute('data-text', count);
            }
        });

        this.eventEmitter.on("word.new", (word, count) => {
            this.wordDisplay.setWord(word);
            if (this.badge && count !== undefined) {
                this.badge.textContent = count;
            }
        });

        this.eventEmitter.on("word.collected", (letter) => {
            this.wordDisplay.onCollected(letter);
        });
    }
}
