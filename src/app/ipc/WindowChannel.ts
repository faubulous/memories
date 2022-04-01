import { BrowserWindow, IpcMainEvent } from 'electron';
import { IpcRequest } from "./IpcRequest";
import { IpcChannelInterface } from "./IpcChannelInterface";

export class WindowChannel implements IpcChannelInterface {
  fullscreen: boolean = false;

  constructor() { }

  getName(): string {
    return 'window';
  }

  handle(event: IpcMainEvent, request: IpcRequest): void {
    if (request.id == 'toggleFullscreen') {
      const window = BrowserWindow.getFocusedWindow();

      this.fullscreen = !this.fullscreen;

      window?.setFullScreen(this.fullscreen)
    }
  }
}

export class ToggleFullscreenRequest extends IpcRequest {
  constructor() {
    super('window', 'toggleFullscreen');
  }
}

export interface InitFilesResponse {
  data: boolean;
}