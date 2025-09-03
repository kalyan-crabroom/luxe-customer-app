
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-session-completed',
  templateUrl: './session-completed.page.html',
  styleUrls: ['./session-completed.page.scss'],
})
export class SessionCompletedPage implements OnInit {
  sessionComplete: FormGroup;
  rate: number = 0;
  selectedCompliments: string[] = [];
  compliments: string[] = ['Friendly', 'Clean', 'Punctual', 'Respectful'];
  booking_Data: any = []
  userDetails: any = []
  logUser: any
  validation_messages = {
    message: [
      { type: 'required', message: 'Message is Required' }
    ]
  }
  helptext: any;
  showSpinner: boolean = false;
  pageText: any;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private navController: NavController
  ) {
    this.getPageText();
    this.sessionComplete = new FormGroup({
      message: new FormControl(''),
      rating: new FormControl('', Validators.required),
    });
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'session_complete');
    }

  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params && params.bookingData) {
        this.booking_Data = JSON.parse(params.bookingData);
        console.log("bookingData :", this.booking_Data);
        this.userDetails = this.booking_Data.user_info
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.logUser = user;
          }
        });
      }
    });
  }

  getPageText() {
    this.showSpinner = true;
    this.apiService.get('pages').subscribe({
      next: (res: any) => {
        this.showSpinner = false;
        if (res.data && res.data.length > 0) {
          const sessionComplete = res.data.find((page: any) => page.slug === 'session-complete');
          this.pageText = sessionComplete ? sessionComplete : null;
        } else {
          this.pageText = null;
        }
      },
      error: (err: any) => {
        this.showSpinner = false;
        this.pageText = null;
      }
    });
  }

  goToReport() {
    let parameter: NavigationExtras = {
      queryParams: {
        bookingData: JSON.stringify({ ...this.booking_Data }),
        report_therapist: true,
      }
    }
    this.router.navigate(['/report-session'], parameter)
  }

  isValidSession(): boolean {
    const isSessionComplete = this.sessionComplete.get('message')?.value.trim();
    return isSessionComplete !== ""
  }

  onSubmit(form: any) {
    // if (this.selectedCompliments.length === 0) {
    //   this.commonService.presentToast('Complements are required', 'danger');
    //   return;
    // }
    const timezone = this.booking_Data.timezone || 'UTC';
    const bookingEnd = moment.tz(
      `${this.booking_Data.booking_date} ${this.booking_Data.end_time}`,
      'YYYY-MM-DD HH:mm:ss',
      timezone
    );

    const currentTime = moment.tz(timezone);

    if (currentTime.isBefore(bookingEnd)) {
      this.commonService.presentToast("You're not able to complete the session until the confirmed end time of the request.");
      return;
    }

    form.complements = this.selectedCompliments
    let payLoad = {
      token: this.logUser.token,
      booking_id: this.booking_Data.id,
      rating: form.rating,
      complements: form.complements,
      message: form.message.trim(),
      amount: this.booking_Data.therapist_pay,
      to_user_id: this.booking_Data.user_info.user_id,
    }

    this.commonService.showLoader();
    this.apiService.send('complete-request', payLoad).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentToast(res.message);
        this.commonService.refresh_mysession.next(1);
        this.navController.navigateRoot(['/tabs/home']);
      },
      error: (err: any) => {
        this.commonService.dismissLoading();
        if (err.error.error_type == 'kyc_pending') {
          this.commonService.presentAlert(err.error.message, err.error.error_title);
        } else {
          this.commonService.presentAlert(err.error.message);
        }
        if (err.error.error_type == 'no_card_added' || err.error.error_type == 'kyc_pending') {
          this.navController.navigateRoot(['/payment-information']);
        }
      }
    })
  }

  selectRate(rate: number) {
    this.rate = rate + 1;
    this.sessionComplete.patchValue({ rating: this.rate });
  }

  toggleCompliment(compliment: string) {
    if (this.isComplimentSelected(compliment)) {
      this.selectedCompliments = this.selectedCompliments.filter((c) => c !== compliment);
    } else {
      this.selectedCompliments.push(compliment);
    }
  }

  isComplimentSelected(compliment: string): boolean {
    return this.selectedCompliments.includes(compliment);
  }
}
