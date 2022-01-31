import { IpcRenderer } from 'electron';
import { IpcRequest } from './IpcRequest';

export class IpcService {
  private ipcRenderer: IpcRenderer;

  constructor() {
    if (!window || !window.process || !window.require) {
      throw new Error(`Unable to require renderer process`);
    }

    this.ipcRenderer = window.require('electron').ipcRenderer;
  }

  public send<T>(request: IpcRequest): Promise<T> {
    const ipcRenderer = this.ipcRenderer;
    ipcRenderer.send(request.requestChannel, request);

    return new Promise(resolve =>
      ipcRenderer.once(request.responseChannel, (event, response) => resolve(response))
    );
  }
}
