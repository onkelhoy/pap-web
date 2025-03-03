import { Vector, VectorObject } from "@papit/game-vector";
import { SimplePolygonObject } from "@papit/game-shape";

import { isPointInTriangle } from "../triangle";
import { SegmentIntersection } from "../line";


export function isPointInPolygonTriangles(point:VectorObject, polygon:SimplePolygonObject) {
  for (let i=0; i<polygon.triangles.length; i+=3)
  {
    const a = polygon.vertices[polygon.triangles[i]];
    const b = polygon.vertices[polygon.triangles[i+1]];
    const c = polygon.vertices[polygon.triangles[i+2]];

    if (isPointInTriangle(point, a, b, c))
    {
      return [true, [a,b,c]];
    }
  }
  
  return false;
}

export function isPointInPolygonRayCasting(point:VectorObject, polygon:SimplePolygonObject) {
  const ray = [point, Vector.Add(point, {x:10000, y:0})];
  let intersections = 0;
  for (let i=0; i<polygon.vertices.length; i++) 
  {
    const a = polygon.vertices[i];
    const b = polygon.vertices[(i + 1) % polygon.vertices.length];

    if (SegmentIntersection(ray[0], ray[1], a, b))
    {
      intersections++;
    }
  }

  return intersections % 2 === 1;
}