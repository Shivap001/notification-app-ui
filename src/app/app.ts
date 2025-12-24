import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Notification App UI');
  protected events = signal<Array<{ caller?: string; extension?: any; requestId?: string }>>([]);

  constructor() {
    this.initEvents();
  }

  private async initEvents() {
    try {
      const client = new EventsClientLib.EventsClient();
      await client.connect('https://vertical-notification-api-h7guhgbnh8d4c2fc.southindia-01.azurewebsites.net/eventsHub');
      // Using wrapper API provided by the bundle: onEvent/onAck/sendAck
      client.onEvent((data: any) => {
        console.log('Received Data:', data);
        const caller = data?.caller ?? data?.from ?? (data?.headers && data.headers.caller) ?? 'unknown';
        const extension = data?.extension ?? data?.extensions ?? data?.payload?.extension ?? null;
        this.events.update(curr => [...curr, { caller, extension, requestId: data?.requestId }]);
        client.sendAck(data?.requestId, 'Processed successfully').catch(() => {});
      });

      //client.onAck((ack: any) => console.log('Ack:', ack));
    } catch (err) {
      console.error('Event client init error', err);
    }
  }
}
