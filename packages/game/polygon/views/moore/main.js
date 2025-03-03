import { Engine } from '@papit/game-engine';
import { LoadImage } from '@papit/game-engine';

// component
import { Polygon } from '@papit/game-polygon';

let engine, polygons, SIZE = 1;

window.onload = () => {
  engine = new Engine("canvas#image", { query: "canvas#display", width: 500, height: 500 });

  const select = document.querySelector("select");
  if (select) {
    select.onchange = change;
    select.dispatchEvent(new Event("change"));
  }
}

async function change(e) {
  const image = await LoadImage(`images/${e.target.value}.png`);

  SIZE = 1;
  if (image.width <= 10) SIZE = 30;
  else if (image.width <= 32) SIZE = 10;
  // clear
  engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);

  // generate 
  engine.ctx.drawImage(image, 0, 0, image.width, image.height);
  polygons = Polygon.Moore(engine.ctx, image.width, image.height, false, 8);


  engine.canvas.width = image.width * SIZE;
  engine.canvas.height = image.height * SIZE;

  // draw
  engine.ctx.imageSmoothingEnabled = false;
  engine.ctx.drawImage(image, 0, 0, engine.canvas.width, engine.canvas.height);
  drawPolygons();
}

function drawPolygons() {
  const display = engine.display;
  // display.resizeCanvasToDisplaySize();
  display.ctx.clearRect(0, 0, display.canvas.width, display.canvas.height);

  polygons.forEach(polygon => {
    polygon.scale(SIZE, "top-left");
    // polygon.add(display.width / 2, display.height / 2)
    polygon.draw(display.ctx);
  });
}