import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {EventBusMessage} from './event-bus.message';
import {StringUtils} from '../../util/string.utils';
import {filter, map} from 'rxjs/operators';

const TAG = 'EventBus';

@Injectable()
export class EventBus {

  private channel: Subject<EventBusMessage>;

  constructor() {
    this.channel = new Subject<EventBusMessage>();
  }

  public publish<T extends EventBusMessage>(message: T): void {

    if (!message.channel || StringUtils.isEmpty(message.channel)) {
      throw new Error('empty channel в event bus' + JSON.stringify(message));
    }

    this.channel.next({channel: message.channel, data: message});
  }

  public of<T extends EventBusMessage>(messageType: { new(...args: any[]): T }): Observable<T> {
    const channel = new messageType().channel;
    return this.channel.pipe(filter(m => m.channel === channel), map(m => m.data));
  }

}
