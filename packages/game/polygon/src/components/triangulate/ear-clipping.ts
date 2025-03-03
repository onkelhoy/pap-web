import { isPointInTriangle } from "@papit/game-intersection";
import { SimplePolygonObject } from "@papit/game-shape";
import { Vector, VectorObject } from "@papit/game-vector";

export function Triangulate(polygon:SimplePolygonObject) {
  // Triangulation of a polygon in 2D.
  // Assumption that the polygon is simple, i.e has no holes, is closed and
  // has no crossings and also that its vertex order is counter clockwise.

  const n = polygon.vertices.length;
  const indices = []; // Array to store the resulting triangles
  const vertlist = Array.from({ length: n }, (_, i) => i); // List of vertex indices
  let index_counter = 0;

  while (vertlist.length > 2) {
    let earFound = false;
    // Iterate through the remaining vertices
    for (let i = 0; i < vertlist.length; i++) {
      const prevIdx = getItem(vertlist, i - 1); // Previous vertex index
      const currIdx = vertlist[i]; // Current vertex index
      const nextIdx = getItem(vertlist, i + 1); // Next vertex index

      const vert_prev = polygon.vertices[prevIdx];
      const vert_current = polygon.vertices[currIdx];
      const vert_next = polygon.vertices[nextIdx];

      // Check if the current vertex is convex
      const is_convex = isConvex(vert_prev, vert_current, vert_next);
      let is_ear = true;

      if (is_convex) {
        // Check if any other vertex is inside the triangle formed by prev, curr, next
        for (let j = 0; j < vertlist.length; j++) {
          if (vertlist[j] !== prevIdx && vertlist[j] !== currIdx && vertlist[j] !== nextIdx) {
            const vert_test = polygon.vertices[vertlist[j]];
            if (isPointInTriangle(vert_prev, vert_current, vert_next, vert_test)) {
              is_ear = false; // Not an ear if a vertex is inside the triangle
              break;
            }
          }
        }
      } else {
        is_ear = false; // Not an ear if not convex
      }

      // If it's an ear, add the triangle to the result and remove the current vertex
      if (is_ear) {
        earFound=true;
        indices[index_counter] = [prevIdx, currIdx, nextIdx];
        index_counter += 1;
        vertlist.splice(i, 1); // Remove the current vertex from the list
        break; // Restart the search for ears
      }
    }

    if (!earFound)
    {
      return [false, "no ear found"];
    }
  }

  const triangles = indices.reduce((prev, current) => prev.concat(current), []);
  polygon.triangles = triangles;
  return [true];
}

function getItem(array:number[], index:number) {
  const n = array.length;
  return array[(index % n + n) % n];
}

function angleCCW(a:VectorObject, b:VectorObject) {
  /// Counter clock wise angle (radians) from normalized 2D vectors a to b

  const dot = a.x*b.x + a.y*b.y;
  const det = a.x*b.y - a.y*b.x;
  let angle = Math.atan2(det, dot);
  if (angle<0.0)  angle = 2.0*Math.PI + angle

  return angle
}

function isConvex(vertex_prev:VectorObject, vertex:VectorObject, vertex_next:VectorObject) {
  /// Determine if vertex is locally convex.

  const a = Vector.Subtract(vertex_prev, vertex);
  const b = Vector.Subtract(vertex_next, vertex);
  const internal_angle = angleCCW(b, a);

  return internal_angle <= Math.PI;
}


//   const n = polygon.vertices.length;
//   if (n < 3) return [];

//   // Create a list of vertex indices
//   let indices = Array.from({ length: n }, (_, i) => i);
//   const triangles = [];

//   while (indices.length > 2) {
//     let earFound = false;

//     for (let i=0; i<indices.length; i++)
//     {
//       const a = getitem(indices, i - 1);
//       const b = indices[i];
//       const c = getitem(indices, i + 1);

//       const va = polygon.vertices[a];
//       const vb = polygon.vertices[b];
//       const vc = polygon.vertices[c];

//       // Check if the angle at b is convex
//       const ab = Vector.Subtract(vb, va);
//       const bc = Vector.Subtract(vc, vb);
//       const cross = Vector.Cross(ab, bc).z;

//       if (cross <= 0) continue; // Skip reflex or colinear vertices

//       // Check if any other vertex is inside the triangle abc
//       let isEar = true;
//       for (let j=0; j<polygon.vertices.length; j++) {
//         const pIndex = indices[j];
//         if (pIndex === a || pIndex === b || pIndex === c) continue;

//         const p = polygon.vertices[pIndex];
//         if (isPointInTriangle(p, vb, va, vc))
//         {
//           isEar = false;
//           break;
//         }
//       }

//       if (isEar) {
//         triangles.push(b);
//         triangles.push(a);
//         triangles.push(c);
        
//         earFound=true;
//         indices.splice(i, 1);
//         break;
//       }
//     }

//     if (!earFound)
//     {
//       polygon.triangles = triangles;
//       return [false, "no further triangle could be established"];
//     }
//   }

//   // add last triangle
//   if (indices.length === 3)
//   {
//     triangles.push(indices[0]);
//     triangles.push(indices[1]);
//     triangles.push(indices[2]);
//   }
//   else 
//   {
//     return [false, "the remaining vertices is not 3"];
//   }

//   polygon.triangles = triangles;
//   return [true];
// }