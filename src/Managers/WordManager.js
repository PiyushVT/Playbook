import Main from "../Main.js";
export default class WordManager {
    constructor(loader) {
        this.loader = loader;
        this.currentWord = '';
        this.collected = {};
        this.isActive = false;
        this.wordCount = 0;
        this.main = new Main();
        this.eventEmitter = this.main.eventEmitter;
    }

    start() {
        this.isActive = true;
        this.setNewWord();
    }

    setNewWord() {
        const lengths = this.loader.getAvailableLengths();
        const length = lengths[Math.floor(Math.random() * lengths.length)];
        this.currentWord = this.loader.getRandomWord(length).toUpperCase();
        this.collected = {};
        console.log('[WordManager] NEW WORD:', this.currentWord);
        this.eventEmitter.trigger('word.new', [this.currentWord, this.wordCount]);
    }

    canSpawnLetter(letter) {
        const total = [...this.currentWord].filter(c => c === letter).length;
        const collected = this.collected[letter] || 0;

        if (total > 0 && collected >= total) {
            console.log('[WordManager] block spawn:', letter);
            return false;
        }
        return true;
    }

    checkStatus(letter) {
        const total = [...this.currentWord].filter(c => c === letter).length;
        const collected = this.collected[letter] || 0;
        return {
            isCorrect: this.currentWord.includes(letter),
            isNeeded: collected < total
        };
    }

    onCollected(letter) {
        console.log('[Collected]', letter);

        if (this.currentWord.includes(letter)) {
            this.collected[letter] = (this.collected[letter] || 0) + 1;
            this.eventEmitter.trigger('word.collected', [letter]);

            if (this.isComplete()) {
                console.log('[WORD COMPLETED]', this.currentWord);
                setTimeout(() => {
                    this.wordCount++;
                    this.setNewWord();
                }, 200);
            }
        } else {
            console.log('[Wrong Letter]', letter);
            this.eventEmitter.trigger('health.reduce', [1]);
        }
    }

    onMissed(letter, x, y) {
        console.log('[Missed]', letter);
        if (this.currentWord.includes(letter)) {
            this.eventEmitter.trigger('health.reduce', [1]);
            if (x !== undefined && y !== undefined) {
                this.eventEmitter.trigger('word.missed', [x, y]);
            }
        }
    }

    isComplete() {
        for (const c of this.currentWord) {
            const needed = [...this.currentWord].filter(x => x === c).length;
            if ((this.collected[c] || 0) < needed) return false;
        }
        return true;
    }
}
