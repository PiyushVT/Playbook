export default class WordDisplayManager {
    constructor() {
        this.container = document.querySelector('.word-outer .letters');
        if (!this.container) {
            console.error('WordDisplayManager: .word-outer .letters not found!');
        }
    }

    setWord(word) {
        if (!this.container) return;
        this.container.innerHTML = '';
        
        for (const char of word) {
            const letterDiv = document.createElement('div');
            letterDiv.className = 'letter pending';
            letterDiv.textContent = char;
            letterDiv.dataset.char = char;
            this.container.appendChild(letterDiv);
        }
    }

    onCollected(letter) {
        if (!this.container) return;
        
        // Find the first pending letter that matches the collected letter
        // Prioritize reserved letters (those being animated to)
        let pendingLetter = Array.from(this.container.children).find(
            div => div.classList.contains('pending') && 
                   div.classList.contains('reserved') && 
                   div.dataset.char === letter
        );

        if (!pendingLetter) {
            pendingLetter = Array.from(this.container.children).find(
                div => div.classList.contains('pending') && 
                       div.dataset.char === letter
            );
        }

        if (pendingLetter) {
            pendingLetter.classList.remove('pending');
            pendingLetter.classList.remove('reserved');
        }
    }

    getTargetForLetter(letter) {
        if (!this.container) return null;

        // Find the first pending and non-reserved letter
        const pendingLetter = Array.from(this.container.children).find(
            div => div.classList.contains('pending') && 
                  !div.classList.contains('reserved') && 
                  div.dataset.char === letter
        );

        if (pendingLetter) {
            pendingLetter.classList.add('reserved');
            const rect = pendingLetter.getBoundingClientRect();
            const canvas = document.querySelector('canvas');
            const canvasRect = canvas.getBoundingClientRect();

            // Calculate center relative to canvas
            // Assuming canvas is fullscreen or aligned with viewport
            // If canvas is scaled (Main.sizes.scale), we might need to adjust?
            // Main.resize logic: canvas.width = rect.width * dpr. ctx scaled by dpr.
            // So logical coordinates (0..rect.width) map to CSS pixels.
            // So simple subtraction is correct.

            return {
                x: rect.left - canvasRect.left + rect.width / 2,
                y: rect.top - canvasRect.top + rect.height / 2,
                w: rect.width,
                h: rect.height
            };
        }
        return null;
    }
}
