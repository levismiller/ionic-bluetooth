import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController, Events } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

import { LoadingController } from '@ionic/angular';



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  private devices: any[];
  private pairedList: pairedlist;
  private unpairedList: pairedlist;
  private listToggle: boolean = false;
  private pairedDeviceID: number = -1;
  private dataSend: string = "";
  private dataRcvd: string = "";
  private isConnected: boolean = false;
  private connectionStatus: string = "Not Connected";

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private bluetoothSerial: BluetoothSerial, 
    public changeDetect: ChangeDetectorRef,
    public events: Events, 
    public loadingController: LoadingController) {
    this.devices = [];
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Connecting...',
      duration: 10000, 
      backdropDismiss: true
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    if (role=="backdrop") {
      this.bluetoothSerial.disconnect();
    }
  }

  async presentLoadingResults() {
    const loading = await this.loadingController.create({
      message: 'Connected To Device',
      duration: 3000, 
      animated: false, 
      spinner: null
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
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
    if (!this.isConnected && this.pairedDeviceID != -1) {
      this.presentLoading();
      let connectedDevice = this.pairedList[this.pairedDeviceID];
      if (!connectedDevice.address) {
        this.showError('Select Paired Device to connect');
        return;
      }
      let address = connectedDevice.address;
      let name = connectedDevice.name;

      this.connect(address);
    }
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
        this.setConnectedStatus(false)
      });
  }

  setConnectedStatus(status) {
    if (status) {
      this.isConnected = true;
      this.connectionStatus = "Connected";
      this.loadingController.dismiss();
      this.presentLoadingResults();
    }
    else {
      this.isConnected = false;
      this.connectionStatus = "Not Connected";
    }
    this.changeDetect.detectChanges();
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe('msg:').subscribe(
      success => {
        this.bluetoothSerial.read(
          success => {
            if (!this.isConnected) {
              this.setConnectedStatus(true);
            }
            console.log(success);
            this.events.publish('dataRcvd', success);
          }, 
          error => {
            this.showError("Error:Connecting to Device");
            this.setConnectedStatus(false);
          });
      }, 
      error => {
        this.showError(error);
      });
  }

  disconnectDevice() {
    if (this.isConnected) {
      // Unsubscribe from data receiving
      this.bluetoothSerial.disconnect();
      this.setConnectedStatus(false);
      this.showToast("Device Disconnected");
    }
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
