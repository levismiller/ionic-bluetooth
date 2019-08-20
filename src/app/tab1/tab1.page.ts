import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  private deviceOutput: string;

  constructor(private bluetoothSerial: BluetoothSerial) {
    this.deviceOutput = '-> Compassing\n     RTK';
  }

  public keypadInput(input) {
    console.log('input', input);
    this.bluetoothSerial.write(input).then(this.success, this.failure);
  }

  public success(data) {
    console.log('success');
    this.deviceOutput = data;
  }

  public failure(err) {
    console.log('failure', err);
  }

}
