import { GAME_CONFIG } from "../../configs/GameConfig.js";

export default class DifficultyManager {
    constructor(wordManager) {
        this.wordManager = wordManager;

        this.correctLetterProbability = GAME_CONFIG.difficulty.correctLetterProbability;
        this.minCorrectLetterProbability = GAME_CONFIG.difficulty.minCorrectLetterProbability;
        this.dropStep = GAME_CONFIG.difficulty.dropStep;
    }

    onWordCompleted() {
        this.correctLetterProbability = Math.max(
            this.minCorrectLetterProbability,
            this.correctLetterProbability - this.dropStep
        );
    }

    getNextLetter() {
        const word = this.wordManager.currentWord;
        if (!word) {
            return this.randomLetter();
        }

        if (Math.random() < this.correctLetterProbability) {
            const needed = [];
            for (const c of word) {
                const total = [...word].filter(x => x === c).length;
                const collected = this.wordManager.collected[c] || 0;
                if (collected < total) {
                    needed.push(c);
                }
            }

            if (needed.length > 0) {
                return needed[Math.floor(Math.random() * needed.length)];
            }
        }

        let letter;
        let safety = 0;
        do {
            letter = this.randomLetter();
            safety++;
        } while (word.includes(letter) && safety < 50);

        return letter;
    }

    randomLetter() {
        return String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
}
