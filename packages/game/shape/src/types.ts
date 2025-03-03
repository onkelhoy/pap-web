import { VectorObject } from "@papit/game-vector";

export type RectangleObject = VectorObject & {
  w: number; 
  h: number;
}

export type CircleObject = VectorObject & {
  r: number; 
}

export interface PolygonObject {
  vertices: VectorObject[];
  triangles: number[];
  boundaryindex: null|number[];
  concave?: boolean;
  id: number;
  centeroffset?: VectorObject;

  get boundary():null|RectangleObject;
  get center():VectorObject;

  getTriangle(i:number): VectorObject[];
}
export type SimplePolygonObject = {
  vertices: VectorObject[];
  triangles: number[];
}

