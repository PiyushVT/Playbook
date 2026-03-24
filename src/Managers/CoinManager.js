import Main from "../Main.js";

export default class CoinManager {
    constructor() {
        this.main = new Main();
        this.eventEmitter = this.main.eventEmitter;
        this.collectedCoins = 0;
        this.init();
    }

    init() {
        this.eventEmitter.on('coin.collected', () => {
            this.addCoin();
        });
    }

    addCoin() {
        this.collectedCoins++;
        console.log("Coins collected:", this.collectedCoins);
        this.eventEmitter.trigger('coin.update', [this.collectedCoins]);
    }

    getCoins() {
        return this.collectedCoins;
    }
}
