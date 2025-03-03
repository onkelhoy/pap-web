import {Vector, VectorObject} from "@papit/game-vector";
import { debounce } from "@papit/core";

// local
import {EarClipping, Monotone} from "./components/triangulate";
import { Generate } from "./components/moore"
import { Pivot } from "./types";
export class Polygon {

  static instances = 0;
  vertices: VectorObject[];
  triangles: number[];
  boundaryindex: null|number[];
  concave?: boolean;
  id: number;
  centeroffset?: Vector;

  constructor(...vertices: VectorObject[]) {
    // super(0, 0, 0); 

    this.vertices = [];
    this.triangles = [];
    this.boundaryindex = null;
    this.id = Polygon.instances++;
    this.vertices = vertices.map(v => new Vector(v));

    if (this.vertices.length > 0)
    {
      this.recalculate();
    }

    this.debouncedmove = debounce(this.move, 50);
  }

  get boundary() {
    if (!this.boundaryindex) this.recalculate();
    if (!this.boundaryindex) {
      throw new Error("polygon has no boundary-index, attempt of recalucating has been made but no success");
    }

    if (this.boundaryindex.length < 3) return {x:0, y:0, w: 0, h: 0}

    return {
      x: this.vertices[this.boundaryindex[0]].x,
      y: this.vertices[this.boundaryindex[1]].y,
      w: this.vertices[this.boundaryindex[2]].x - this.vertices[this.boundaryindex[0]].x, 
      h: this.vertices[this.boundaryindex[3]].y - this.vertices[this.boundaryindex[1]].y, 
    }
  }
  supportFunction(direction: VectorObject) {
    // TODO fix me to return the furtherst away point nearest to the direction based on center (in a smart way)
    return {
      x: 0,
      y: 0,
      z: 0,
    }
  }

  get x() {
    if (this.vertices.length === 0) throw new Error("could not set x of empty polygon");
    return this.vertices[0].x;
  }
  get y() {
    if (this.vertices.length === 0) throw new Error("could not set y of empty polygon");
    return this.vertices[0].y;
  }
  set x(value) {
    this.debouncedmove(value, this.y);
  }
  set y(value) {
    this.debouncedmove(this.x, value);
  }

  get center() {
    if (!this.centeroffset)
    {
      return Vector.Zero;
    }

    return this.centeroffset.Add(this.vertices[0]);
  }

  private getPivot(pivot: Pivot = "center-center") {
    let pivotPoint:Vector = Vector.Zero;
    switch (pivot) {
      case "top-left":
        pivotPoint.x = this.boundary.x;
        pivotPoint.y = this.boundary.y;
        break;
      case "top-center":
        pivotPoint.x = this.center.x;
        pivotPoint.y = this.boundary.y;
        break;
      case "top-right":
        pivotPoint.x = this.boundary.x + this.boundary.w;
        pivotPoint.y = this.boundary.y;
        break;

      case "center-left":
        pivotPoint.x = this.boundary.x;
        pivotPoint.y = this.center.y;
        break;
      case "center-center":
        pivotPoint = this.center;
        break;
      case "center-right":
        pivotPoint.x = this.boundary.x + this.boundary.w;
        pivotPoint.y = this.center.y;
        break;

      case "bottom-left":
        pivotPoint.x = this.boundary.x;
        pivotPoint.y = this.boundary.y + this.boundary.h;
        break;
      case "bottom-center":
        pivotPoint.x = this.center.x;
        pivotPoint.y = this.boundary.y + this.boundary.h;
        break;
      case "bottom-right":
        pivotPoint.x = this.boundary.x + this.boundary.w;
        pivotPoint.y = this.boundary.y + this.boundary.h;
        break;
    }

    return pivotPoint;
  }

  private debouncedmove(x:number|VectorObject, y?:number) { }

  add(x:number|VectorObject, y?:number) {
    const pos = Vector.toVector(x, y);
    for (let v of this.vertices)
    {
      v.x += pos.x;
      v.y += pos.y;
    }
  }

  move(x:number|VectorObject, y?:number, pivot: Pivot = "center-center") {
    const pos = Vector.toVector(x, y);
    const pivotPoint = this.getPivot(pivot);
    const d = pos.Sub(pivotPoint);

    for (let v of this.vertices)
    {
      v.x += d.x;
      v.y += d.y;
    }
  }

  scale(factor:number, pivot: Pivot = "center-center") {
    const pivotPoint = this.getPivot(pivot);

    for (let v of this.vertices)
    {
      const delta = pivotPoint.Sub(v);
      const mag = delta.magnitude;
      const angle = delta.angle;
      const d = mag * factor;

      v.x = pivotPoint.x - Math.cos(angle) * d;
      v.y = pivotPoint.y - Math.sin(angle) * d;
    }
  }

  recalculate() {
    // setting properties
    this.centeroffset = Vector.Zero;
    this.boundaryindex = [];
    this.concave = false;

    // no point for polygons less then or equal to 2 
    if (this.vertices.length <= 2) return;
    
    // boundary calculation
    let minx = Number.MAX_SAFE_INTEGER;
    let miny = Number.MAX_SAFE_INTEGER;
    let maxx = Number.MIN_SAFE_INTEGER;
    let maxy = Number.MIN_SAFE_INTEGER;
    let minxindex = -1;
    let minyindex = -1;
    let maxxindex = -1;
    let maxyindex = -1;

    // keep track on number of convex and concave to determine if concave + counter clockwise direction
    let convex = 0, concave = 0;
    for (let i=0; i<this.vertices.length; i++)
    {
      const v = this.vertices[i];
      const prev = (i - 1 + this.vertices.length) % this.vertices.length;
      const next = (i + 1) % this.vertices.length;

      // vector AB : previous to current 
      const AB = Vector.Subtract(v, this.vertices[prev]);
      // vector BC : current to next
      const BC = Vector.Subtract(this.vertices[next], v);

      const crossproduct = Vector.Cross(AB, BC).z;

      if (crossproduct > 0)
      {
        convex++;
      }
      else if (crossproduct < 0)
      {
        concave++;
      }
      else 
      {
        // its collinear
        this.vertices.splice(i, 1);

        // Adjust the index after removing the vertex
        i--;

        // continue to next iteration 
        continue;
      }
      
      if (this.vertices.length === 0) return;

      // add each vertex
      this.centeroffset.add(v);

      // get min-max for boundary
      if (v.x < minx) 
      {
        minx = v.x;
        minxindex = i;
      }
      if (v.x > maxx) 
      {
        maxx = v.x;
        maxxindex = i;
      }
      if (v.y < miny) 
      {
        miny = v.y;
        minyindex = i;
      }
      if (v.y > maxy) 
      {
        maxy = v.y;
        maxyindex = i;
      }
    }

    if (this.vertices.length === 0) return;
    
    // set the boundary 
    this.boundaryindex = [minxindex, minyindex, maxxindex, maxyindex];

    if (concave > convex)
    {
      // counter clockwise
      this.vertices = this.vertices.reverse();
      
      // need to flip the boundary indexes
      this.boundaryindex = this.boundaryindex.map(i => this.vertices.length - 1 - i);
    }
    this.concave = convex > 0 && concave > 0;

    // set the center to median of vertices 
    this.centeroffset.divide(this.vertices.length||1);
    this.centeroffset.sub(this.vertices[0]);

    // call triangulation
    this.triangulate();
  }

  triangulate() {
    EarClipping.Triangulate(this);
  }

  getTriangle(i:number) {
    return [
      this.vertices[this.triangles[i * 3]],
      this.vertices[this.triangles[i * 3 + 1]],
      this.vertices[this.triangles[i * 3 + 2]],
    ]
  }
  getTriangles() {
    const triangles = [];
    for (let i=0; i<(this.triangles.length/3); i++) {
      triangles.push(this.getTriangle(i));
    }

    return triangles;
  }

  draw(ctx:CanvasRenderingContext2D, strokecolor="black", fillcolor="rgba(0,0,0,0.1)", r=1) {
    ctx.strokeStyle = strokecolor;
    
    this.vertices.forEach((v, i) => {
      Vector.Draw(v, ctx, strokecolor, r * 3);

      ctx.fillText(String(i), v.x, v.y - 10);
    });

    const c = this.center;
    ctx.fillText(String(this.id), c.x, c.y);
    
    ctx.lineWidth = r / 2;
    ctx.setLineDash([10, 15]);
    for (let i=0; i<this.triangles.length; i+=3) {
      const a = this.vertices[this.triangles[i]];
      const b = this.vertices[this.triangles[i + 1]];
      const c = this.vertices[this.triangles[i + 2]];

      ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(a.x, a.y);
        ctx.stroke();
      ctx.closePath();
    }

    ctx.setLineDash([]);
    ctx.lineWidth = r;
    if (this.vertices.length > 1)
    {
      ctx.beginPath();
      for (let i=0; i<this.vertices.length; i++) {
        if (i === 0)
        {
          ctx.moveTo(this.vertices[i].x, this.vertices[i].y);
        }
        else 
        {
          ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
      }
  
      ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
  
      ctx.stroke();
      ctx.fillStyle = fillcolor;
      ctx.fill();
      ctx.closePath();

      const boundary = this.boundary;
      if (boundary)
      {
        ctx.beginPath();
          ctx.lineWidth = r / 2;
          ctx.setLineDash([10, 15]);
          ctx.rect(boundary.x, boundary.y, boundary.w, boundary.h);
          ctx.stroke();
        ctx.closePath();
      }
    }
  }

  static Moore (ctx:CanvasRenderingContext2D, width:number, height: number, holes = false, distanceThreshold?: number, angleThreshold?: number) {
    return Generate(ctx, width, height, holes, distanceThreshold, angleThreshold);
  }
}