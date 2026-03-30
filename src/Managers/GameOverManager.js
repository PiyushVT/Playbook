import Main from "../Main.js";
import MraidBridge from "../MraidBridge.js";
import { CTA_URL } from "../../sources.js";

export default class GameOverManager {
    constructor() {
        this.main = new Main();
        this.eventEmitter = this.main.eventEmitter;
        
        this.screen = document.querySelector('.level-complete-screen');
        this.titleSpan1 = document.querySelector('.level-complete-text-span-1');
        this.titleSpan2 = document.querySelector('.level-complete-text-span-2');
        this.scoreValue = document.querySelector('.score-value');
        this.coinsCollectedText = document.querySelector('.coins-collected-text');
        this.replayButton = document.querySelector('.replay-button');
        
        if (this.screen) {
            this.screen.style.display = 'flex';
        }

        this.replayButton.addEventListener('click', () => {
            MraidBridge.open(CTA_URL);
        });
    }

    init() {
        this.eventEmitter.on('game.over', () => {
            this.show('LEVEL', 'COMPLETE');
        });
        
        this.eventEmitter.on('level.complete', () => {
            this.show('LEVEL', 'COMPLETE');
        });
    }

    show(text1, text2) {
        if (!this.screen) return;
        
        if (this.titleSpan1) this.titleSpan1.textContent = text1;
        if (this.titleSpan2) this.titleSpan2.textContent = text2;
        
        const badge = document.querySelector('.badge');
        if (this.scoreValue && badge) {
            this.scoreValue.textContent = badge.textContent;
            this.scoreValue.setAttribute('data-text', badge.textContent);
        }

        if (this.coinsCollectedText && this.main.coinManager) {
            const coins = this.main.coinManager.getCoins();
            this.coinsCollectedText.textContent = coins;
            this.coinsCollectedText.setAttribute('data-text', coins);
        }

        this.screen.style.display = 'flex';
        
        void this.screen.offsetWidth;
        
        this.screen.classList.add('visible');
    }
}
