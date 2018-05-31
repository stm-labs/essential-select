export abstract class EventBusMessage {
  channel: string;
  data: any;
}

export class MaterialDesignClickedBusMessage extends EventBusMessage{

  constructor() {
    super();
    this.channel = 'MaterialDesignClickedBusMessage';
  }

}
