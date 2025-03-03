// core
import { Engine } from '@papit/game-engine';
import { InputEvents } from "@papit/game-input-events";

// component
import { Polygon } from '@papit/game-polygon';

let engine, events;
const vertices = [];
let polygon;

window.onload = () => {
  engine = new Engine("canvas");
  engine.canvas.width = window.innerWidth;
  engine.canvas.height = window.innerHeight;
  events = new InputEvents(engine.canvas, { mouse: { pointerlock: false } });

  events.on("mouse-up", handlemouseup);
  polygon = new Polygon({ "x": 157, "y": 166, "z": 0 }, { "x": 162, "y": 169, "z": 0 }, { "x": 165, "y": 173, "z": 0 }, { "x": 169, "y": 177, "z": 0 }, { "x": 178, "y": 189, "z": 0 }, { "x": 182, "y": 192, "z": 0 }, { "x": 185, "y": 196, "z": 0 }, { "x": 190, "y": 198, "z": 0 }, { "x": 195, "y": 199, "z": 0 }, { "x": 205, "y": 199, "z": 0 }, { "x": 210, "y": 198, "z": 0 }, { "x": 215, "y": 196, "z": 0 }, { "x": 225, "y": 194, "z": 0 }, { "x": 235, "y": 194, "z": 0 }, { "x": 240, "y": 197, "z": 0 }, { "x": 244, "y": 200, "z": 0 }, { "x": 247, "y": 204, "z": 0 }, { "x": 248, "y": 209, "z": 0 }, { "x": 248, "y": 214, "z": 0 }, { "x": 246, "y": 219, "z": 0 }, { "x": 241, "y": 221, "z": 0 }, { "x": 236, "y": 224, "z": 0 }, { "x": 221, "y": 230, "z": 0 }, { "x": 206, "y": 233, "z": 0 }, { "x": 186, "y": 233, "z": 0 }, { "x": 181, "y": 234, "z": 0 }, { "x": 156, "y": 234, "z": 0 }, { "x": 151, "y": 232, "z": 0 }, { "x": 146, "y": 231, "z": 0 }, { "x": 141, "y": 229, "z": 0 }, { "x": 136, "y": 229, "z": 0 }, { "x": 131, "y": 228, "z": 0 }, { "x": 116, "y": 228, "z": 0 }, { "x": 111, "y": 227, "z": 0 }, { "x": 101, "y": 227, "z": 0 }, { "x": 86, "y": 230, "z": 0 }, { "x": 81, "y": 232, "z": 0 }, { "x": 46, "y": 239, "z": 0 }, { "x": 41, "y": 241, "z": 0 }, { "x": 16, "y": 241, "z": 0 }, { "x": 11, "y": 239, "z": 0 }, { "x": 7, "y": 236, "z": 0 }, { "x": 5, "y": 231, "z": 0 }, { "x": 7, "y": 226, "z": 0 }, { "x": 15, "y": 220, "z": 0 }, { "x": 30, "y": 214, "z": 0 }, { "x": 40, "y": 212, "z": 0 }, { "x": 45, "y": 212, "z": 0 }, { "x": 50, "y": 210, "z": 0 }, { "x": 60, "y": 210, "z": 0 }, { "x": 65, "y": 209, "z": 0 }, { "x": 75, "y": 209, "z": 0 }, { "x": 80, "y": 208, "z": 0 }, { "x": 85, "y": 208, "z": 0 }, { "x": 90, "y": 206, "z": 0 }, { "x": 95, "y": 205, "z": 0 }, { "x": 105, "y": 201, "z": 0 }, { "x": 109, "y": 198, "z": 0 }, { "x": 115, "y": 188, "z": 0 }, { "x": 121, "y": 180, "z": 0 }, { "x": 125, "y": 176, "z": 0 }, { "x": 133, "y": 170, "z": 0 }, { "x": 143, "y": 166, "z": 0 });
  polygon.scale(2)
  polygon.add(200, 0)
  draw();
}

function draw() {
  engine.ctx.clearRect(0, 0, engine.width, engine.height);
  polygon.draw(engine.ctx);
}

function handlemouseup(e) {
  // mouse up 
  vertices.push({ x: events.mouse.position.x, y: events.mouse.position.y });
  polygon = new Polygon(...vertices);
  draw();
}