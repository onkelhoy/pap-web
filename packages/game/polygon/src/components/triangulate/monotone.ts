import { Vector } from "@papit/game-vector";
import { Polygon } from "../../component";

export function Triangulate(polygon: Polygon) {
  const vertices = polygon.vertices.map((v, index) => ({...v, index}));
  const n = vertices.length;
  if (n < 3) return [false, "polygon is less then 3 vertices"];

  // Sort vertices by y-coordinate (ascending)
  vertices.sort((a, b) => a.y - b.y);

  const triangles = [];
  const stack = [];

  // Initialize stack with the first two vertices
  stack.push(vertices[0]);
  stack.push(vertices[1]);

  for (let i = 2; i < n; i++) {
    const current = vertices[i];

    // Check if the current vertex is on the same side as the top of the stack
    const top = stack[stack.length - 1];
    const nextToTop = stack[stack.length - 2];

    const suba = Vector.Subtract(nextToTop, top);
    const subb = Vector.Subtract(current, top);
    const cross = Vector.Cross(suba, subb).z;

    if (cross > 0) {
      // Current vertex is on the left side
      while (stack.length > 1) {
        const p1 = stack.pop();
        const p2 = stack[stack.length - 1];
        if (p1 !== undefined) triangles.push([p2.index, p1.index, current.index]);
        else console.log('no p1')
      }
      stack.pop();
    } else {
      // Current vertex is on the right side
      while (stack.length > 1) {
        const p1 = stack.pop();
        const p2 = stack[stack.length - 1];
        if (p1 !== undefined) triangles.push([p2.index, p1.index, current.index]);
        else console.log('no p1')
      }
    }

    stack.push(current);
  }

  polygon.triangles = triangles.reduce((prev, current) => prev.concat(current), []);
  console.log("triangles", polygon.triangles, polygon.vertices);
  return [true];
}