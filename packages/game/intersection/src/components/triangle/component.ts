import { Vector, VectorObject } from "@papit/game-vector";

/**
 * 
 * @param {VectorObject} p 
 * @param {VectorObject} a 
 * @param {VectorObject} b 
 * @param {VectorObject} c 
 */
export function isPointInTriangle(p:VectorObject, a:VectorObject, b:VectorObject, c:VectorObject) {

  /// Determine if a vertex p is inside (or "on") a triangle made of the
  /// points a->b->c
  /// http://blackpawn.com/texts/pointinpoly/

  // Compute vectors
  const v0 = Vector.Subtract(c, a);
  const v1 = Vector.Subtract(b, a);
  const v2 = Vector.Subtract(p, a);

  // Compute dot products
  const dot00 = Vector.Dot(v0, v0);
  const dot01 = Vector.Dot(v0, v1);
  const dot02 = Vector.Dot(v0, v2);
  const dot11 = Vector.Dot(v1, v1);
  const dot12 = Vector.Dot(v1, v2);
  
  // Compute barycentric coordinates
  const denom = dot00*dot11 - dot01*dot01
  if (Math.abs(denom) < 1e-20) return true;
  const invDenom = 1.0 / denom
  const u = (dot11*dot02 - dot01*dot12) * invDenom
  const v = (dot00*dot12 - dot01*dot02) * invDenom
  
  // Check if point is in triangle
  return (u >= 0) && (v >= 0) && (u + v < 1)
}