import { WORDS } from "../configs/Words.js";

export default class WordLoader {
    getRandomWord(length) {
        const list = WORDS[length];
        const word = list[Math.floor(Math.random() * list.length)];
        console.log('[WordLoader] chosen word:', word);
        return word.toLowerCase();
    }

    getAvailableLengths() {
        return Object.keys(WORDS).map(Number);
    }
}
