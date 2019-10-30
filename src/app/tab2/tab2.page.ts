import { Component } from '@angular/core';
import { ToastController, AlertController, Events } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  private devices: any[];
  private pairedList: pairedlist;
  private listToggle: boolean = false;
  private pairedDeviceID: number = 0;
  private dataSend: string = "";
  private dataRcvd: string = "";

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private bluetoothSerial: BluetoothSerial, 
    public events: Events) {
    this.devices = [];
  }

  ngOnInit() {
    this.checkBluetoothEnabled();
  }

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled().then(
      success => {
        this.listPairedDevices();
      }, 
      error => {
        this.showError("Please Enable Bluetooth")
      });
  }

  listPairedDevices() {
    this.bluetoothSerial.list().then(
      success => {
        this.pairedList = success;
        this.listToggle = true;
      }, 
      error => {
        this.showError("Please Enable Bluetooth")
        this.listToggle = false;
      });
  }

  setPairedDeviceID(idx) {
    this.pairedDeviceID = idx;
  }

  selectDevice() {
    let connectedDevice = this.pairedList[this.pairedDeviceID];
    if (!connectedDevice.address) {
      this.showError('Select Paired Device to connect');
      return;
    }
    let address = connectedDevice.address;
    let name = connectedDevice.name;

    this.connect(address);
  }

  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bluetoothSerial.connect(address).subscribe(
      success => {
        this.deviceConnected();
        this.showToast("Successfully Connected");
      }, 
      error => {
        this.showError("Error:Connecting to Device");
      });
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe('msg:').subscribe(
      success => {
        // this.bluetoothSerial.read().then(this.readData, this.showError);
        this.bluetoothSerial.read(
          success => {
            this.events.publish('dataRcvd', success);
          }, 
          error => {
            this.showError("Error:Connecting to Device");
          });
      }, 
      error => {
        this.showError(error);
      });
  }

  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bluetoothSerial.disconnect();
    this.showToast("Device Disconnected");
  }

  showError(error) {
    console.log('error', error);
  }

  showToast(msg) {
    console.log('toast', msg);
  }

}

interface pairedlist {
  "class": number,
  "id": string,
  "address": string,
  "name": string
}
