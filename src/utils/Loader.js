export default class Loader {
    constructor(assets) {
        this.assets = assets;
        this.items = {};
        this.loaded = 0;
        this.total = this.count(assets);
    }

    count(obj) {
        return Object.values(obj).reduce((sum, v) => {
            return sum + (typeof v === 'string' ? 1 : this.count(v));
        }, 0);
    }

    load() {
        return new Promise(resolve => {
            const promises = [];

            if (this.assets.images) {
                Object.entries(this.assets.images).forEach(([key, src]) => {
                    promises.push(this.loadImage(key, src));
                });
            }

            if (this.assets.fonts) {
                Object.entries(this.assets.fonts).forEach(([key, src]) => {
                    promises.push(this.loadFont(key, src));
                });
            }

            Promise.all(promises).then(() => {
                resolve(this.items);
            });
        });
    }

    loadImage(key, src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.items[key] = img;
                this.loaded++;
                resolve(img);
            };
            img.src = src;
        });
    }

    async loadFont(key, src) {
        const font = new FontFace(key, `url(${src})`);
        await font.load();
        document.fonts.add(font);
        this.items[key] = key; // Store font name/family as item
        this.loaded++;
        return font;
    }

    progress() {
        return this.loaded / this.total;
    }
}
