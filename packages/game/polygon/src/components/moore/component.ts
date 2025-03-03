// import statements 
import {Vector, VectorObject} from "@papit/game-vector";
import { isPointInPolygonRayCasting } from "@papit/game-intersection";

/// local 
import {Pixel, Point} from "./types";
import {Polygon} from "../../component";

//#region utility functions
const DISTANCE_THRESHOLD = 4;
const ANGLE_THRESHOLD = 0.0001;
function canAdd(prev: VectorObject|null, point:VectorObject, points:VectorObject[], distanceThreshold = DISTANCE_THRESHOLD, angleThreshold = ANGLE_THRESHOLD) {
  if (prev === null) return true;

  const fixedpoint = points[points.length - 1];
  const distance = Vector.Distance(fixedpoint, prev);
  if (distance < distanceThreshold) return false;

  // angle calculation
  const AB = Vector.Subtract(fixedpoint, prev);
  const BC = Vector.Subtract(prev, point);
  const dot = AB.dot(BC);
  const mag1 = AB.magnitude;
  const mag2 = BC.magnitude;
  const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  return angle >= angleThreshold;
}
function isEmpty(pixel:Pixel) {
  if (pixel.outofbounds) return true;
  return pixel.r === 255 && pixel.g === 255 && pixel.b === 255;
}
function getPixelAtIndex(i:number, imageData:ImageData):Pixel {
  return {
    outofbounds: false,
    index: i,
    r: imageData.data[i],
    g: imageData.data[i + 1],
    b: imageData.data[i + 2],
    a: imageData.data[i + 3],
  }
}
function getPixel(x:number, y:number, imageData:ImageData):Pixel {
  if (x < 0 || y < 0 || x >= imageData.height || y >= imageData.width) {
    return {
      outofbounds: true,
      r: 0,
      g: 255,
      b: 255,
      a: 255,
    }
  }

  const index = y * imageData.width + x;
  return getPixelAtIndex(index * 4, imageData); // rgba
}
function key(x:number, y:number) {
  return `${x}x${y}`;
}
function toPoint(x:number, y:number):Point {
  return {
    x, 
    y,
    key: key(x, y),
  };
}
function isEdge(point:Point, imageData:ImageData) {
  const pixel = getPixel(point.x, point.y, imageData);
  if (isEmpty(pixel)) return false;

  for (let y=0; y<3;y++) {
  for (let x=0; x<3;x++) {
    const p = getPixel(point.x - 1 + x, point.y - 1 + y, imageData);
    if (isEmpty(p)) return true;
  }}

  return false;
}
//#endregion

export function Generate(ctx:CanvasRenderingContext2D, width:number, height: number, holes = false, distanceThreshold = DISTANCE_THRESHOLD, angleThreshold = ANGLE_THRESHOLD) {
  const imageData = ctx.getImageData(0, 0, width, height);

  // Directions for 8-connected neighbors (clockwise order)
  const directions = [
    toPoint(1, 0),   // Right
    toPoint(1, -1),  // Bottom-Right
    toPoint(0, -1),  // Bottom
    toPoint(-1, -1), // Bottom-Left
    toPoint(-1, 0),  // Left
    toPoint(-1, 1),  // Top-Left
    toPoint(0, 1),  // Top
    toPoint(1, 1)    // Top-Right
  ];

  const polygons = [];
  const visited:Record<string, boolean> = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const point = toPoint(x, y);
      if (visited[point.key]) continue;
      if (!isEdge(point, imageData)) continue;

      let found = false;
      for (let polygon of polygons)
      {
        if (isPointInPolygonRayCasting(point, polygon))
        {
          found = true;
          break;
        }
      }
      if (found) continue;

      // Found a new shape, start tracing
      const verticies:Array<Point> = [];
      let currentPoint = toPoint(x, y);
      let previousPoint: Point|null = null;
      let previousDirection = 4; // Start by looking to the left

      do {
        if (canAdd(previousPoint, currentPoint, verticies, distanceThreshold, angleThreshold)) 
        {
          if (previousPoint) verticies.push(previousPoint);
          else verticies.push(currentPoint);
        }

        visited[currentPoint.key] = true;

        // Find the next neighbor in clockwise order
        let foundNext = false;
        for (let i = 0; i < directions.length; i++) {
          const directionIndex = (previousDirection + i) % directions.length;
          const direction = directions[directionIndex];

          const next = toPoint(currentPoint.x + direction.x, currentPoint.y + direction.y);

          if (!visited[next.key] && isEdge(next, imageData)) {
            previousPoint = currentPoint;
            currentPoint = next;
            
            previousDirection = (directionIndex + 5) % directions.length; // Update direction
            foundNext = true;
            visited[next.key] = true;
            break;
          }
          else visited[next.key] = true;
        }

        if (!foundNext) break; // No more neighbors, exit loop

      } while (currentPoint.key !== point.key);

      const polygon = new Polygon(...verticies);
      if (polygon.verticies.length > 2)
      {
        polygons.push(polygon);
      }
    }
  }

  return polygons;
}

// function moore(start:Point, imageData:ImageData, visited:Record<string,boolean>) {
//   const boundary = [];
//   let counter = 0;
//   boundary.push(start);
//   console.log('Start boundary tracing at:', start);

//   let prev: Point | null = null;
//   let current = start;
//   let lastwhite: VectorObject | null = null;

//   do {
//     counter++;
//     if (counter > 10000) {
//       console.log("Boundary tracing failed: exceeded maximum iterations", boundary);
//       return boundary;
//     }

//     const neighbors = Neighbours(current, lastwhite);
//     let next: Point | null = null;

//     for (const neighbor of neighbors) {
//       if (!visited[neighbor.key]) {
//         const px = getPixel(neighbor.x, neighbor.y, imageData);

//         if (!isEmpty(px)) {
//           next = neighbor;
//           break;
//         }

//         lastwhite = neighbor;
//       }
//     }

//     if (!next) {
//       console.log("No valid neighbor found");
//       break;
//     }

//     visited[next.key] = true;
//     if (prev && canAdd(boundary[boundary.length - 1], prev, next)) {
//       boundary.push(prev);
//     }

//     prev = current;
//     current = next;
//   } while (current.key !== start.key);


//   boundary.push(current); // Close the boundary
//   console.log('boundary', boundary);
//   return boundary;
// }

// function MooreBoundary(start:Point, imageData:ImageData, visited:Record<string,boolean>) {
//   const boundary = [];
//   boundary.push(start);

//   let lastwhite: VectorObject = { x: start.x - 1, y: start.y }; // one to left of start 
//   let current = start;
//   let prev:Point|null = null;
//   console.log('start', start);
  
//   do
//   {
//     let neighbours = Neighbours(current, lastwhite);
//     for (let neighbour of neighbours)
//     {
//       current = neighbour;
//       const pixel = getPixel(neighbour.x, neighbour.y, imageData);
//       if (isEmpty(pixel))
//       {
//         visited[neighbour.key] = true;
//         if (lastwhite === null) lastwhite = neighbour;
//         continue;
//       }
  
//       if (visited[neighbour.key])
//       {
//         // shape is closed?
//         console.log('shape is closed', neighbour);
//         return boundary;
//       }

//       visited[neighbour.key] = true;
//       neighbours = Neighbours(neighbour, lastwhite);
//       boundary.push(neighbour);
//     }
//   } while (current.key !== start.key) 


//   console.log('boundary', boundary);
//   return boundary;
// }

// export function Generate(ctx:CanvasRenderingContext2D, width:number, height: number, noholes = true) {
//   const imageData = ctx.getImageData(0, 0, width, height);
//   const polygons:Polygon[] = [];
//   const visited:Record<string,boolean> = {};

//   for (let y=0; y<imageData.height; y++) {
//     // let prev = false; // previous pixel holding state of empty 
//     for (let x=0; x<imageData.width; x++) {
//       if (isEmpty(getPixel(x, y, imageData))) {
//         // prev = false;
//         continue;
//       }

//       const k = key(x, y);
//       if (visited[k]) continue;
//       // visited[k] = true;
      
//       // we only interessted when previous pixel is empty and current is not, 
//       // not when both previous and current is filled then we are in middle of a shape
//       // if (prev) continue; 
//       // prev = true;
      
//       if (noholes) {
//         // "safe check" - prevents holes however.. 
//         let found = false;
//         for (let pol of polygons) {
//           if (isPointInPolygonRayCasting({x,y}, pol)) {
//             found = true;
//             break;
//           }
//         }
//         if (found) continue;
//       }

//       const boundary = MooreBoundary({x, y, key: key(x, y)}, imageData, visited);

//       // const boundary = moore({x, y, key: key(x, y)}, imageData, visited);
//       // const p = new Polygon(...boundary)
//       // // we should cleanup the boundary
//       // polygons.push(p);
//     }
//   }

//   return polygons;
// }

// const MOORE_SET = [
//   {x:-1,y:-1}, // NW
//   {x:0, y:-1}, // N
//   {x:1, y:-1}, // NE
//   {x:1, y:0},  // E
//   {x:1, y:1},  // SE
//   {x:0, y:1},  // S
//   {x:-1,y:1},  // SW
//   {x:-1,y:0},  // W
// ];
// function* Neighbours(c:VectorObject, lastwhite:null|VectorObject) {
//   let startIndex = 0;
//   if (lastwhite)
//   {
//     const d = Vector.Subtract(lastwhite, c);
//     startIndex = MOORE_SET.findIndex(a => a.x === d.x && a.y === d.y);
//     if (startIndex == -1) startIndex = 0;
//   }

//   for (let i=0; i<8; i++) {
//     const direction = MOORE_SET[(startIndex + i) % 8];
//     const v = Vector.Add(c, direction);
//     yield {
//       x: v.x,
//       y: v.y,
//       key: key(v.x, v.y),
//     };
//   }
// }
// function getVertex(point: Point, prev: Point, imageData: ImageData) {
//   const neighbours = Neighbours(point, prev);
//   let p = prev;

//   for (let neighbour of neighbours)
//   {
//     const pixel = getPixel(neighbour.x, neighbour.y, imageData);

//     if (isEmpty(pixel)) {
//       p = neighbour;
//       continue;
//     }
    
//     return { current: neighbour, prev: p }
//   }

//   return null;
// }
// function getPolygon(x:number, y:number, imageData: ImageData) {
//   const start = toPoint(x, y);
//   const verticies = [start];

//   let current = start;
//   let prev = toPoint(start.x - 1, start.y);
//   let counter = 0;

//   do 
//   {
//     const vertex = getVertex(current, prev, imageData);
//     if (!vertex) throw new Error("Could not determine vertex");

//     current = vertex.current;
//     prev = vertex.prev;

//     verticies.push(current);
//     counter++;
//     if (counter > 100) {
//       console.log('error', vertex);
//       throw new Error("maxed out");
//     }
//   }
//   while (start.key !== current.key);
//   return new Polygon(...verticies);
// }