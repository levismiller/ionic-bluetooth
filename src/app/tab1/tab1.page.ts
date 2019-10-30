import { Component, ChangeDetectorRef } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Events } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  private deviceOutput: string;
  private blah: string="blah";

  constructor(private bluetoothSerial: BluetoothSerial, 
              public events: Events, 
              public changeDetect: ChangeDetectorRef) {
    this.deviceOutput = '';
    // this.events.subscribe('dataRcvd', this.getData);
    this.events.subscribe('dataRcvd', (data) => {
      console.log(data);
      this.deviceOutput = data;
      this.changeDetect.detectChanges();
    });
  }

  public keypadInput(input) {
    console.log('input', input);
    this.bluetoothSerial.write(input).then(this.success, this.failure);
  }

  public success(data) {
    console.log('success');
  }

  public failure(err) {
    console.log('failure', err);
  }

}
