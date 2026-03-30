import Main from "./src/Main.js";
import MraidBridge from "./src/MraidBridge.js";

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const main = new Main(canvas, ctx);

MraidBridge.waitForViewable().then(() => {
    main.start();
});
