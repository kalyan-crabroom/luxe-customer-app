import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-report-session',
  templateUrl: './report-session.page.html',
  styleUrls: ['./report-session.page.scss'],
})
export class ReportSessionPage implements OnInit {
  reportSession: FormGroup
  logUser: any
  booking_Data: any = []
  validation_messages = {
    reason: [
      { type: 'required', message: 'Reason is required.' }
    ]
  }
  report_therapist = false;
  helptext: any;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.reportSession = new FormGroup({
      reason: new FormControl("", Validators.compose([
        Validators.required,
      ]))
    });

    if (this.commonService.helptext.length > 0) {
    this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'report_request');
    console.log("help text:",this.helptext);
    }

  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      console.log("params :",params);
      if (params && params.bookingData) {
        this.booking_Data = JSON.parse(params.bookingData);
        console.log('booking_Data', this.booking_Data);

        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.logUser = user;
          }
        });
      }
      if (params.report_therapist) {
        this.report_therapist = params.report_therapist;
      }
    });
  }

  isReportValid(): boolean {
    const reportData = this.reportSession.get('reason')?.value?.trim(); 
    return reportData !== '';
  }

  onSubmit(form: any) {
    let payload = {
      token: this.logUser.token,
      booking_id: this.booking_Data.id,
      type: 'report',
      reason: form.reason.trim(),
      to_user_id: this.report_therapist ? this.booking_Data.user_id : null
    }
    this.commonService.showLoader();
    this.apiService.send('report', payload).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(res.message);
        this.router.navigate(['/tabs/mysessions'])
      },
      error: (err: any) => {
        console.log('err', err);
        this.commonService.dismissLoading();
      }
    });
  }
}
