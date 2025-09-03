import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RangeCustomEvent } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.page.html',
  styleUrls: ['./notification-settings.page.scss'],
})
export class NotificationSettingsPage implements OnInit {
  notificationSettings: FormGroup
  logUser: any
  constructor(
    private storageService: StorageService,
    private commonService: CommonService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.notificationSettings = new FormGroup({
      distance: new FormControl()
    })
  }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((User: any) => {
      if (User != null) {
        this.logUser = User;
        this.getNotification()
      }
    });
  }

  getNotification() {
    this.commonService.showLoader();
    this.apiService.fetchData('get-notification-distance', this.logUser.token).subscribe(
      (res: any) => {
        this.commonService.dismissLoading();
        const data = res.notification_distance;
        if (data && typeof data.value === 'string') {
          const distanceValue = Number(data.value);
          if (!isNaN(distanceValue)) {
            this.notificationSettings.patchValue({
              distance: distanceValue,
            });
          } else {
            console.warn('Invalid distance value:', data.value);
          }
        } else {
          console.warn('Invalid data format:', data);
        }
      },
      (err: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    );
  }

  onRangeChange(event: RangeCustomEvent) {
    const value = event.detail.value;
    this.notificationSettings.get('distance')?.setValue(value);
  }

  onSubmit(form: any) {
    form.token = this.logUser.token
    this.commonService.showLoader()
    this.apiService.send('save-notification-distance', form).subscribe((res: any) => {
      this.commonService.dismissLoading()
      this.router.navigate(['/tabs/home'])
    }, (err: any) => {
      console.log('err', err);
      this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message)
    })
  }

}
