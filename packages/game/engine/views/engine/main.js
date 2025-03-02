import { Engine } from '@papit/game-engine';

let engine;

window.onload = () => {
  engine = new Engine("canvas", "canvas#c2", "canvas#c3");

  window.engine = engine;
}
