import Main from "../Main.js";
import { STORAGE_KEYS } from "../../sources.js";

export default class HealthBarManager {
    constructor() {
        this.main = new Main();
        this.eventEmitter = this.main.eventEmitter;       
        this.container = document.querySelector(".health-bar");
        this.segmentClasses = [];
        this.maxHealth = 0;
        this.currentHealth = 0;
    }

    init() {
        if (!this.container) return;
        const existing = Array.from(this.container.querySelectorAll(".segment"));
        // Only read classes if not already read (to preserve original colors on restart)
        if (this.segmentClasses.length === 0) {
             this.segmentClasses = existing.map(el => {
                const classes = Array.from(el.classList).filter(c => c !== "segment");
                return classes;
            });
        }
       
        this.container.innerHTML = "";
        const segments = [];

        this.segmentClasses.forEach(classes => {
            const el = document.createElement("div");
            el.classList.add("segment");
            classes.forEach(c => el.classList.add(c));
            
            // Animation styles
            // Start with scaleX 0 to fill from left
            el.style.transformOrigin = "left center";
            // Important: Use CSS variable or set directly, but ensure it's not overridden by class
            el.style.transform = "scaleX(0)";
            // Transition for smooth filling
            el.style.transition = "transform 0.25s linear";
            
            this.container.appendChild(el);
            segments.push(el);
        });

        // Force reflow to ensure initial state is applied
        this.container.offsetHeight;

        this.maxHealth = this.segmentClasses.length;
        this.currentHealth = this.maxHealth;
        
        this.container.style.opacity = "0";
        this.container.style.transition = "opacity 0.3s ease";
        this.segments = segments;
        this.hasAnimated = false;

        const playAnimation = () => {
            if (this.hasAnimated) return;
            this.hasAnimated = true;
            this.container.style.opacity = "1";
            const step = 1000 / this.segments.length;
            this.segments.forEach((el, i) => {
                setTimeout(() => {
                    el.style.transform = "scaleX(1)";
                }, i * step);
            });
        };

        const ftuePlayed = localStorage.getItem(STORAGE_KEYS.showFtue);

        if (ftuePlayed) {
            playAnimation();
        } else if (!this.listenerAdded) {
            this.listenerAdded = true;
            this.eventEmitter.on("player.dragged", playAnimation); 
        }
    }

    reduce(amount = 1) {
        if (!this.container) return;
        for (let i = 0; i < amount; i++) {
            if (this.currentHealth <= 0) break;
            const last = this.container.lastElementChild;
            if (last) {
                this.container.removeChild(last);
                this.currentHealth -= 1;
            }
        }
        if (this.currentHealth <= 0) {
            this.eventEmitter.trigger("game.over");
        }
    }
}
