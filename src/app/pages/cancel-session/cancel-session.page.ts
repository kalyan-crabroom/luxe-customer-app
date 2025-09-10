import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { StorageService } from 'src/app/services/storage.service';
import { CommonService } from 'src/app/services/common.service';
import { ApiService } from 'src/app/services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-cancel-session',
  templateUrl: './cancel-session.page.html',
  styleUrls: ['./cancel-session.page.scss'],
})
export class CancelSessionPage implements OnInit {
  sessionInfo: any;
  loginUser: any;
  cancelForm = new FormGroup({
    reason: new FormControl("", Validators.compose([Validators.required])),
  });

  validation_messages = {
    reason: [{ type: "required", message: "Reason is required." }]
  }
  helptext: any;
  cancellationPolicyData: any = null;
  showSpinner: boolean = true;

  constructor(
    private router: Router,
    private location: Location,
    private storageService: StorageService,
    private commonService: CommonService,
    private apiService: ApiService
  ) {
    this.getPolicy();

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.loginUser = user;
      }
    });

    if (this.router.getCurrentNavigation()?.extras.state) {
      this.sessionInfo = this.router.getCurrentNavigation()?.extras.state;
      console.log("sessionInfo :", this.sessionInfo);
    }
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'cancel_request');
    }
  }

  ngOnInit() {
  }

  back() {
    this.location.back();
  }

  cancelSession(data: any) {
    const sessionStartTime = moment.tz(
      `${this.sessionInfo.booking_date} ${this.sessionInfo.booking_start_time}`,
      'YYYY-MM-DD hh:mm A',
      this.sessionInfo.timezone
    );

    const now = moment.tz(this.sessionInfo.timezone);
    const hoursDiff = sessionStartTime.diff(now, 'hours', true);
    const isWithin4Hours = hoursDiff < 4;
    if (isWithin4Hours) {
      this.commonService.presentConfirmAlert(
        'We’re sorry you’re cancelling. Please note that it’s within the 4 hour timeframe for refunds and you’ll be charged the full amount. Do you still want to cancel?',
        'Yes',
        'No'
      ).then((confirmed) => {
        if (confirmed) {
          this.proceedWithCancellation(data, 'Your massage appointment has been canceled.');
        } else {
          this.commonService.presentToast('Good choice! Enjoy your massage!', 'success');
        }
      });
    } else {
      this.commonService.presentConfirmAlert(
        'Are you sure you want to cancel your massage appointment?',
        'Yes',
        'No'
      ).then((confirmed) => {
        if (confirmed) {
          this.proceedWithCancellation(data, 'Your massage appointment has been canceled.');
        }
      });
    }
  }

  proceedWithCancellation(data: any, finalMessage: string) {
    const payload = {
      token: this.loginUser.token,
      session_id: this.sessionInfo.id,
      reason: data.reason,
      status: this.sessionInfo.status,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    this.commonService.showLoader();
    this.apiService.send('cancelSession', payload).subscribe((res: any) => {
      this.commonService.dismissLoading();
      this.commonService.presentAlert(finalMessage);
      this.storageService.refresh_storage.next(1);
      this.router.navigate(['/tabs/home']);
    }, (err: any) => {
      console.log(err.error);
      this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });
  }

  // cancelSession(data: any) {
  //   this.commonService.showLoader();
  //   let payload = {
  //     token: this.loginUser.token,
  //     session_id: this.sessionInfo.id,
  //     reason: data.reason,
  //     status: this.sessionInfo.status,
  //     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  //   }
  //   this.apiService.send('cancelSession', payload).subscribe((res: any) => {
  //     this.commonService.dismissLoading();
  //     this.commonService.presentAlert(res.message);
  //     this.storageService.refresh_storage.next(1);
  //     this.router.navigate(['/tabs/home']);
  //   }, (err: any) => {
  //     console.log(err.error);
  //     this.commonService.dismissLoading();
  //     this.commonService.presentAlert(err.error.message);
  //   });
  // }

  getPolicy() {
    this.showSpinner = true;
    this.apiService.get('pages').subscribe((res: any) => {
      this.showSpinner = false;
      if (res.data && res.data.length > 0) {
        const cancellationPolicy = res.data.find((page: any) => page.slug === 'cancellation-policy');
        this.cancellationPolicyData = cancellationPolicy ? cancellationPolicy : null;
      } else {
        this.cancellationPolicyData = null;
      }
      console.log("cancellationPolicyData :", this.cancellationPolicyData);

    }, (err) => {
      this.showSpinner = false;
      this.cancellationPolicyData = null;
    });
  }

}
