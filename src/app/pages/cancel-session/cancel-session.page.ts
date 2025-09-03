import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-cancel-session',
  templateUrl: './cancel-session.page.html',
  styleUrls: ['./cancel-session.page.scss'],
})
export class CancelSessionPage implements OnInit {
  cancelSession: FormGroup
  booking_Data: any = []
  validation_messages = {
    reason: [
      { type: 'required', message: 'This Field is required' }
    ]
  }
  logUser: any;
  helptext: any;
  cancellationPolicyData: any = null;
  showSpinner: boolean = true;

  constructor(
    private apiService: ApiService,
    private CommonService: CommonService,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.getPolicy();
    this.cancelSession = new FormGroup({
      reason: new FormControl('', Validators.required)
    });
    if (this.CommonService.helptext.length > 0) {
      this.helptext = this.CommonService.helptext.find((res: any) => res.page_name == 'cancel_session');
    }
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params && params.bookingData) {
        this.booking_Data = JSON.parse(params.bookingData);
        console.log('booking_Data', this.booking_Data);
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.logUser = user;
          }
        });
      }
    });
  }

  isValidSession(): boolean {
    const sessionData = this.cancelSession.get('reason')?.value.trim()
    return sessionData !== ''
  }

  onSubmit(form: any) {
    let payload = {
      token: this.logUser.token,
      booking_id: this.booking_Data.id,
      type: 'cancel',
      reason: form.reason.trim(),
      to_user_id: this.booking_Data.user_id
    }
    console.log('payload', payload);

    this.CommonService.showLoader();
    this.apiService.send('report', payload).subscribe((res: any) => {
      console.log('res', res);
      this.CommonService.dismissLoading();
      this.CommonService.presentAlert(res.message);
      this.CommonService.refresh_mysession.next(1);
      this.router.navigate(['/tabs/mysessions'])
    }, (err: any) => {
      console.log('err', err);
      this.CommonService.dismissLoading();
    });
  }

  getPolicy() {
    this.showSpinner = true;
    this.apiService.get('pages').subscribe((res: any) => {
      this.showSpinner = false;
      if (res.data && res.data.length > 0) {
        const cancellationPolicy = res.data.find((page: any) => page.slug === 'cancellation-policy-therapist');
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
