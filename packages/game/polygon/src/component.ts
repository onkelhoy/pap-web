import {Vector, VectorObject} from "@papit/game-vector";
import {Triangulate} from "./components/triangulate";
import { Shape } from "@papit/game-shape";

export class Polygon implements Shape {

  static instances = 0;
  verticies: VectorObject[];
  triangles: number[];
  boundaryindex: null|number[];
  concave?: boolean;
  id: number;
  centeroffset?: Vector;

  constructor(...verticies: VectorObject[]) {
    this.verticies = [];
    this.triangles = [];
    this.boundaryindex = null;
    this.id = Polygon.instances++;

    for (let v of verticies) {
      this.verticies.push(new Vector(v));
    }

    if (this.verticies.length > 0)
    {
      this.recalculate();
    }
  }

  get boundary() {
    if (!this.boundaryindex) this.recalculate();
    if (!this.boundaryindex) {
      throw new Error("polygon has no boundary-index, attempt of recalucating has been made but no success");
    }

    return {
      x: this.verticies[this.boundaryindex[0]].x,
      y: this.verticies[this.boundaryindex[1]].y,
      w: this.verticies[this.boundaryindex[2]].x - this.verticies[this.boundaryindex[0]].x, 
      h: this.verticies[this.boundaryindex[3]].y - this.verticies[this.boundaryindex[1]].y, 
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
    if (this.verticies.length === 0) throw new Error("could not set x of empty polygon");
    return this.verticies[0].x;
  }
  get y() {
    if (this.verticies.length === 0) throw new Error("could not set y of empty polygon");
    return this.verticies[0].y;
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

    return this.centeroffset.Add(this.verticies[0]);
  }

  private debouncedmove(x:number|VectorObject, y?:number) {
    
  }

  move(x:number|VectorObject, y?:number) {
    
  }

  recalculate() {
    // setting properties
    this.centeroffset = Vector.Zero;
    this.boundaryindex = [];
    this.concave = false;

    // no point for polygons less then or equal to 2 
    if (this.verticies.length <= 2) return;
    
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
    for (let i=0; i<this.verticies.length; i++)
    {
      const v = this.verticies[i];
      const prev = (i - 1 + this.verticies.length) % this.verticies.length;
      const next = (i + 1) % this.verticies.length;

      // vector AB : previous to current 
      const AB = Vector.Subtract(v, this.verticies[prev]);
      // vector BC : current to next
      const BC = Vector.Subtract(this.verticies[next], v);

      const crossproduct = Vector.Cross(AB, BC);

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
        this.verticies.splice(i, 1);

        // Adjust the index after removing the vertex
        i--;

        // continue to next iteration 
        continue;
      }

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
    
    // set the boundary 
    this.boundaryindex = [minxindex, minyindex, maxxindex, maxyindex];

    if (concave > convex)
    {
      // counter clockwise
      this.verticies = this.verticies.reverse();
      
      // need to flip the boundary indexes
      this.boundaryindex = this.boundaryindex.map(i => this.verticies.length - 1 - i);
    }
    this.concave = convex > 0 && concave > 0;

    // set the center to median of verticies 
    this.centeroffset.divide(this.verticies.length);
    this.centeroffset.sub(this.verticies[0]);

    // call triangulation
    this.triangulate();
  }

  triangulate() {
    Triangulate(this);
  }

  getTriangle(i:number) {
    return [
      this.verticies[this.triangles[i * 3]],
      this.verticies[this.triangles[i * 3 + 1]],
      this.verticies[this.triangles[i * 3 + 2]],
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
    
    this.verticies.forEach((v, i) => {
      Vector.Draw(v, ctx, strokecolor, r * 3);

      ctx.fillText(String(i), v.x, v.y - 10);
    });

    const c = this.center;
    ctx.fillText(String(this.id), c.x, c.y);
    
    ctx.lineWidth = r / 2;
    ctx.setLineDash([10, 15]);
    for (let i=0; i<this.triangles.length; i+=3) {
      const a = this.verticies[this.triangles[i]];
      const b = this.verticies[this.triangles[i + 1]];
      const c = this.verticies[this.triangles[i + 2]];

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
    if (this.verticies.length > 1)
    {
      ctx.beginPath();
      for (let i=0; i<this.verticies.length; i++) {
        if (i === 0)
        {
          ctx.moveTo(this.verticies[i].x, this.verticies[i].y);
        }
        else 
        {
          ctx.lineTo(this.verticies[i].x, this.verticies[i].y);
        }
      }
  
      ctx.lineTo(this.verticies[0].x, this.verticies[0].y);
  
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
}