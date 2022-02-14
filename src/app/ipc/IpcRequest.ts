export class IpcRequest {
  readonly id: string;

  readonly requestChannel: string;

  readonly responseChannel: string;

  params?: any;

  constructor(requestChannel: string, id: string) {
    this.id = id;
    this.requestChannel = `${requestChannel}`;
    this.responseChannel = `${requestChannel}:${id}:${Date.now()}`;
  }
}
