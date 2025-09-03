import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { Device } from '@capacitor/device';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})

export class CommonService {
  loading: any;
  refresh_home: any = new BehaviorSubject(0);
  refresh_mysession: any = new BehaviorSubject(0);
  firebase_push_token: any = new BehaviorSubject(null);
  notification_count: BehaviorSubject<any> = new BehaviorSubject(null);
  firebase_token: any;
  helptext:any = [];

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private apiService: ApiService,
    private storageService : StorageService
  ) {    
    this.firebase_push_token.subscribe((res: any) => {
      if (res) {
        this.firebase_token = res;
      }
    });

    this.storageService.getFromStorage('luxe-customer-help-text').then((result:any)=>{
      if(result){
        this.helptext = result;
        console.log("help text :",this.helptext);
      }
    });
  }
  

  async dismissLoading() {
    this.loadingCtrl.getTop().then(v => v ? this.loadingCtrl.dismiss() : null);
  }

  async showLoader(msg: string = '') {
    if (msg === '') {
      msg = 'Please wait...';
    }
    if (this.loading) {
      this.loading.dismiss();
    }
    this.loading = await this.loadingCtrl.create({ message: msg });
    await this.loading.present();
  }

  async presentToast(msg: any, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: color,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  async presentAlert(msg: any, heading = 'Notice'): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: heading,
        message: msg,
        buttons: [{
          text: 'OK',
          handler: () => {
            resolve(true);
          }
        }]
      });
      await alert.present();
    })
  }
  
  async save_device_details(token: any) {
    const device_id = (await Device.getId()).identifier;
    const device_info = await Device.getInfo();
    let api_data = {
      token: token,
      platform: device_info.platform,
      deviceToken: this.firebase_token,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      uuid: device_id,
      model: device_info.model
    }
    console.log('api_data', api_data);
    this.apiService.send('save-device-details', api_data).subscribe((res: any) => {
      console.log("res SaveDevice:", res);
    }, (err) => {
      console.log("err :", err);
    });
  }

  getFileNameFromPath(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    return parts.pop() || '';
  }

  
}
