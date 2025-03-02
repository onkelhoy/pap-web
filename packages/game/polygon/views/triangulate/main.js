// core
import { Engine } from '@papit/game-engine';
import { InputEvents } from "@papit/game-input-events";

// component
import { Polygon } from '@papit/game-polygon';

let engine, events;
const verticies = [];
let polygon;

window.onload = () => {
  engine = new Engine("canvas");
  engine.canvas.width = window.innerWidth;
  engine.canvas.height = window.innerHeight;
  events = new InputEvents(engine.canvas, { mouse: { pointerlock: false } });

  events.on("mouse-up", handlemouseup);
}

function draw() {
  engine.ctx.clearRect(0, 0, engine.width, engine.height);
  polygon.draw(engine.ctx);
}

function handlemouseup(e) {
  // mouse up 
  verticies.push({ x: events.mouse.position.x, y: events.mouse.position.y });
  polygon = new Polygon(...verticies);
  draw();
}