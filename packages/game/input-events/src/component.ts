import { Vector } from "@papit/game-vector";

import { DefaultMouseSettings, Mouse } from "./components/mouse";
import { Keyboard } from "./components/keyboard";
import { Touches } from "./components/touches";
import { Settings } from "./types";

export class InputEvents extends EventTarget {
  settings: Settings; 
  mouse: Mouse;
  touch: Touches;
  keyboard: Keyboard;
  position: Vector;
  movement: Vector;
  pressing: boolean = false;

  constructor(canvas:HTMLCanvasElement, settings: Settings) {
    super();
    this.settings = getSettings(settings);

    this.mouse = new Mouse(canvas, this.settings.mouse);
    this.touch = new Touches(canvas);
    this.keyboard = new Keyboard();
    this.position = Vector.Zero;
    this.movement = Vector.Zero;
    this.verbose = !!this.settings.verbose;

    this.mouse.on("down", this.handledown);
    this.mouse.on("up", this.handleup);
    this.mouse.on("move", this.handlemove);

    this.touch.on("last-down", this.handledown);
    this.touch.on("last-up", this.handleup);
    this.touch.on("last-move", this.handlemove);
  }

  set verbose (value:boolean) {
    this.mouse.verbose = value;
    this.keyboard.verbose = value;
    this.touch.verbose = value;
  }

  handledown = (e: Event) => {
    if (e.target instanceof Mouse || e.target instanceof Touches)
    {
      this.position = e.target.position;
      this.movement = e.target.movement;
      this.pressing = true;
  
      this.dispatchEvent(new Event("mouse-down"));
    }
  }
  handleup = (e: Event) => {
    if (e.target instanceof Mouse || e.target instanceof Touches)
    {
      this.position = e.target.position;
      this.movement = e.target.movement;
      this.pressing = false;

      this.dispatchEvent(new Event("mouse-up"));
    }
  }
  handlemove = (e: Event) => {
    if (e.target instanceof Mouse || e.target instanceof Touches)
    {
      this.position = e.target.position;
      this.movement = e.target.movement;

      this.dispatchEvent(new Event("mouse-move"));
    }
  }

  key(name:string) {
    return this.keyboard.keys[name];
  }
  onkey(eventname:string, callback: EventListenerOrEventListenerObject | null) {
    this.keyboard.on(eventname, callback);
  }

  on(eventname:string, callback: EventListenerOrEventListenerObject | null) {
    switch (eventname)
    {
      case "mouse-move":
      case "mouse-up":
      case "mouse-down":
        this.addEventListener(eventname, callback);

      case "move":
      case "down":
      case "up":
        this.mouse.addEventListener(eventname as "move"|"down"|"up", callback);
        this.touch.addEventListener(eventname as "move"|"down"|"up", callback);

      case "cancel":
        this.touch.addEventListener(eventname as "cancel", callback);

      default:
        this.keyboard.on(eventname, callback);
    }
  }
}

// helper functions
function getSettings(_settings: Settings) {
  const settings = {
    ...(_settings || {}),
    mouse: {
      ...DefaultMouseSettings,
      ...(_settings?.mouse || {})
    }
  };

  return settings;
}