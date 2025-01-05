/**
 * @file this file is dedicated for all canvas related functionalities - this is rather simple 
 * @module engine
 * @author Henry Pap [onkelhoy@gmail.com]
 */

import { 
  InfoType,
  Setting, 
  SettingCallback,
  ShaderSource,
} from "./types";

/**
 * @typedef {object} EngineSettings
 * @property {string} [query]
 * @property {string} [type=2d]
 * @property {number} [width] 
 * @property {number} [height] 
 * @property {Function[]} [callbacks] 
 */

export class Engine {

  info: Array<InfoType> = [];

  /**
   * 
   * @param  {...string|EngineSettings} selectors 
   */
  constructor(...selectors:(Partial<Setting>|string)[]) {
    // allows for multiple canvases to exist
    this.info = [];
    if (selectors.length === 0) selectors.push('canvas');
    for (const selector of selectors)
    {
      const _setting:Partial<Setting> = {
        query: "",
        width: window.innerWidth,
        height: window.innerHeight,
        timer: null,
        state: "paused",
        previous: null,
        callbacks: [],
        documentElemenet: document,
        contextSetting: undefined,
      }
      if (typeof selector === "string")
      {
        _setting.query = selector;
        _setting.type = "2d"
      }
      else 
      {
        _setting.query = selector.query ?? "";
        _setting.width = selector.width ?? window.innerWidth;
        _setting.height = selector.height ?? window.innerHeight;
        _setting.callbacks = selector.callbacks ?? [];
        _setting.documentElemenet = selector.documentElemenet ?? document;

        if (!selector.type) {
          _setting.type = "2d";
        }
        else 
        {
          _setting.type = selector.type;
          _setting.contextSetting = selector.contextSetting
        }
      }
      const setting = _setting as Setting;

      const element = setting.documentElemenet.querySelector<HTMLCanvasElement>(setting.query);
      if (!element) throw new Error(`[error engine] could not find element: [${setting.query}]`);
      const context = element.getContext(setting.type, setting.contextSetting);
      if (context === null) {
        alert(
          `Unable to initialize ${setting.type}. Your browser or machine may not support it.`,
        );
        return;
      }

      if (!context) throw new Error('[error engine] could not create rendering context');
      element.width = setting.width;
      element.height = setting.height;

      let info:InfoType|null = null;

      if (["webgl", "webgl2"].includes(setting.type)) {
        info = {
          type: "webgl",
          setting,
          element,
          context: context as WebGL2RenderingContext|WebGLRenderingContext,
          materials: new Map(),
        }
      }
      else {
        info = {
          type: "standard",
          setting,
          element,
          context: context as CanvasRenderingContext2D,
        }
      }

      this.info.push(info);
    }
  }

  get canvas () {
    return this.getCanvas(0);
  }
  get element () {
    return this.getCanvas(0);
  }
  get setting() {
    return this.getSetting(0);
  }
  get context() {
    return this.getContext(0);
  }
  get ctx() {
    return this.getContext(0);
  }
  get gl() {
    return this.getContext<WebGL2RenderingContext>(0);
  }
  get gl1() {
    return this.getContext<WebGLRenderingContext>(0);
  }
  get bitmap() {
    return this.getContext<WebGLRenderingContext>(0);
  }

  get width () {
    return this.canvas.width;
  }
  get height () {
    return this.canvas.height;
  }

  getSetting(index:number) {
    return this.info[index]?.setting;
  }
  getContext<T = CanvasRenderingContext2D>(index:number) {
    return this.info[index]?.context as T;
  }
  getElement(index:number) {
    return this.info[index]?.element;
  }
  getCanvas(index:number) { // this is mostly there as I'd probably forget about element : but element makes more sense as a name
    return this.info[index]?.element;
  }

  loop(callback:SettingCallback, index = 0) {
    const setting = this.getSetting(index);
    setting.state = "running";

    const loopfunction = () => {
      if (setting.state === "paused")
      {
        if (setting.timer !== null) cancelAnimationFrame(setting.timer);
        return;
      }

      let delta = -1;
      const now = performance.now();
      if (setting.previous)
      {
        delta = now - setting.previous;
      }
      setting.previous = now;
      if (callback) callback(delta);
      setting.callbacks.forEach(cb => cb(delta)); 
      setting.timer = requestAnimationFrame(loopfunction);
    }

    loopfunction();
  }
  stop(index:number = 0) {
    const setting = this.getSetting(index);
    if (setting) {
      setting.state = "paused"
    }
  }

  // WEBGL related 

  /**
   * This function will remove a selected material from the gl-context, errors are logged and null is returned 
   * @param name string - used to locate material 
   * @param index number - used to locate which context (defaults to first)
   * @returns true
   */
  deleteMaterial(name:string, index:number = 0) {
    const info = this.info[index];
    if (info == null) throw new Error("info not found");
    if (info.type !== "webgl") throw new Error("context is not WebGL: " + info.setting.type);
    const material = info.materials.get(name as string);
    if (!material) throw new Error("material not found");

    const gl = info.context;
    gl.deleteProgram(material);
    return true;
  }
  /**
   * This function will remove a selected material from the gl-context, errors are logged and null is returned 
   * @param name string - used to locate material 
   * @param index number - used to locate which context (defaults to first)
   * @returns true | null
   */
  deleteMaterialSafe(name:string, index:number = 0) {
    try {
      return this.deleteMaterial(name, index);
    }
    catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * This functions creates a material by accepting a vertex and a fragment shader, if error it throws a Error 
   * @param name string name of the material 
   * @param vertex ShaderSource
   * @param fragment ShaderSource
   * @param index number used to locate which context (defaults to first)
   * @returns WebGLProgram
   */
  async createMaterial(name: string, vertex: ShaderSource, fragment: ShaderSource, index:number = 0) {
    const info = this.info[index];
    if (info == null) throw new Error("info not found");
    if (info.type !== "webgl") throw new Error("context is not WebGL: " + info.setting.type);
    if (info.materials.has(name)) throw new Error("material with this name already exist: " + name)
    const gl = info.context;
    
    const material = gl.createProgram();
    info.materials.set(name, material);
    
    // vertex shader 
    const vertexShader = await this.createShader("vertex", vertex, gl);
    gl.attachShader(material, vertexShader);

    // fragment shader 
    const fragmentShader = await this.createShader("fragment", fragment, gl);
    gl.attachShader(material, fragmentShader);

    // link the material/program 
    gl.linkProgram(material);
    
    if (!gl.getProgramParameter(material, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(material);
      gl.deleteProgram(material);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      throw new Error("unable to link the material: " + log);
    }

    return material
  }
  /**
   * This functions creates a material by accepting a vertex and a fragment shader, if error it logs and returns null
   * @param name string name of the material 
   * @param vertex ShaderSource
   * @param fragment ShaderSource
   * @param index number used to locate which context (defaults to first)
   * @returns WebGLProgram | null
   */
  async createMaterialSafe(name: string, vertex: ShaderSource, fragment: ShaderSource, index:number = 0) {
    try {
      return this.createMaterial(name, vertex, fragment, index);
    }
    catch (e) {
      console.error(e);
      return null;
    }
  }
  /**
   * This function creates a shader from a source, if error it throws a Error 
   * @param type vertext | fragment
   * @param source ShaderSource
   * @param gl WebGLRenderingContext | WebGL2RenderingContext
   * @returns Promise WebGLShader
   */
  async createShader(type: "vertex"|"fragment", source: ShaderSource, gl:WebGLRenderingContext | WebGL2RenderingContext) {
    let shaderSource:string|null;
    if (typeof source === "string") shaderSource = source;
    else {
      const res = await fetch(source.url);
      const text = await res.text();
      shaderSource = text;
    }

    let shader: WebGLShader|null = null;
    
    if (type == "vertex") shader = gl.createShader(gl.VERTEX_SHADER);
    else if (type == "fragment") shader = gl.createShader(gl.FRAGMENT_SHADER);
    else {
      throw new Error("type must be either of type vertex or fragment: " + type);
    }

    if (shader == null) {
      throw new Error("could not create shader");
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);  // Clean up the shader
      throw new Error('[error] compiling shader: ' + error);
    }

    return shader;
  }
  /**
   * This function creates a shader from a source, if error it logs and returns null
   * @param type vertext | fragment
   * @param source ShaderSource
   * @param gl WebGLRenderingContext | WebGL2RenderingContext
   * @returns Promise WebGLShader | null
   */
  async createShaderSafe(type: "vertex"|"fragment", source: ShaderSource, gl:WebGLRenderingContext | WebGL2RenderingContext) { 
    try {
      return this.createShader(type, source, gl);
    }
    catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * sets the current material to context, if error it throws Error 
   * @param name string name of the material 
   * @param index number used to locate which context (defaults to first)
   */
  useMaterial(name:string, index:number) {
    const info = this.info[index];
    if (info == null) throw new Error("info not found");
    if (info.type !== "webgl") throw new Error("context is not WebGL: " + info.setting.type);
    const material = info.materials.get(name as string);
    if (!material) throw new Error("material not found");

    const gl = info.context;
    gl.useProgram(material);
  }

  /**
   * sets the current material to context, if error it logs and return false 
   * @param name string name of the material 
   * @param index number used to locate which context (defaults to first)
   * @returns boolean state if success (true) or error
   */
  useMaterialSafe(name:string, index:number) {
    try {
      this.useMaterial(name, index);
      return true;
    }
    catch (e) {
      console.error(e);
      return false;
    }
  }
}


export function LoadImage(src:string):Promise<HTMLImageElement> {
  return new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      res(img);
    }
  });
}