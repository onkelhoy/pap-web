// import statements 
// system 
import { CustomElement } from "../element/class";
import { property } from "../../decorators/property";
import { Setting } from "../element/types";

export class CustomElementInternals extends CustomElement {
  static formAssociated = true;
  protected _internals: ElementInternals;

  @property({ rerender: false, type: Boolean, aria: 'aria-disabled', removeAttribute: true }) disabled?: boolean;

  constructor(setting?: Partial<Setting>) {
    super(setting);
    this._internals = this.attachInternals();
  }

  protected formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  protected formAssociatedCallback(form: HTMLFormElement) {
    console.log('[field]: formAssociatedCallback', form)
  }

  protected formStateRestoreCallback(state: any, mode: any) {
    console.log('[field]: formStateRestoreCallback', { state, mode })
  }

  protected checkValidity(): boolean {
    if (this._internals === undefined) return true;
    return this._internals?.checkValidity();
  }

  protected reportValidity(): boolean {
    if (this._internals === undefined) return true;
    return this._internals?.reportValidity();
  }

  protected setValidity(flags?: ValidityStateFlags | undefined, message?: string | undefined, anchor?: HTMLElement | undefined) {
    if (!this._internals === undefined) return;
    this._internals.setValidity(flags, message, anchor || undefined);
  }
}