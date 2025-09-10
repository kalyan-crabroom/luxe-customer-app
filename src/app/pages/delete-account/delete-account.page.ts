import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.page.html',
  styleUrls: ['./delete-account.page.scss'],
})
export class DeleteAccountPage implements OnInit {
  deleteAccount: FormGroup
  logUser: any = []
  validation_messages = {
    reason: [
      { type: 'required', message: 'Reason is required.' }
    ]
  }
  constructor(
    private alertController: AlertController,
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private navControler: NavController
  ) {
    this.deleteAccount = new FormGroup({
      reason: new FormControl("", Validators.required)
    })
  }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });
  }

  async onSubmit(data: any) {
    const alert = await this.alertController.create({
      header: 'Delete!',
      subHeader: 'Are you sure you want to delete your account? Make sure you can not access your account once you submit your request.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: async () => {
            console.log(data);
            let body = {
              token: this.logUser.token,
              reason: data.reason
            }
            await this.commonService.showLoader()
            this.apiService.send('requestDeleteAccount', body).subscribe({
              next: async (res: any) => {
                await this.commonService.dismissLoading();
                this.storageService.removeFromStorage('deeplyCalm:user');
                this.navControler.navigateRoot(['/login']);
              },
              error: async (error: any) => {
                await this.commonService.dismissLoading();
                console.log('error', error);
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

}
