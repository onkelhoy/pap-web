import { Engine } from '@papit/game-engine';
import { LoadImage } from '@papit/game-engine';

// component
import { Polygon } from '@papit/game-polygon';

let engine;

window.onload = () => {
  engine = new Engine("canvas#image", "canvas#display");

  const select = document.querySelector("select");
  if (select) {
    select.onchange = change;
    select.dispatchEvent(new Event("change"));
  }
}

async function change(e) {
  const image = await LoadImage(`images/${e.target.value}.png`);

  let SIZE = 1;
  if (image.width <= 10) SIZE = 30;
  else if (image.width <= 32) SIZE = 10;
  // clear
  engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
  engine.display.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);

  // generate 
  engine.ctx.drawImage(image, 0, 0, image.width, image.height);
  const polygons = Polygon.Moore(engine.ctx, image.width, image.height);

  engine.canvas.width = engine.display.canvas.width = image.width * SIZE;
  engine.canvas.height = engine.display.canvas.height = image.height * SIZE;

  polygons.forEach(polygon => {
    polygon.scale(2);
    polygon.add(engine.canvas.width / 2, engine.canvas.height / 2)
    polygon.draw(engine.display.ctx);
  });

  // draw

  engine.ctx.imageSmoothingEnabled = false;
  engine.ctx.drawImage(image, 0, 0, engine.canvas.width, engine.canvas.height);
}