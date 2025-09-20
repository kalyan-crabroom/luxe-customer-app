import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-selected-session',
  templateUrl: './selected-session.page.html',
  styleUrls: ['./selected-session.page.scss'],
})
export class SelectedSessionPage implements OnInit {
  bookingId: any
  logUser: any = []
  bookingDetails: any = undefined;
  ready: boolean = false;
  helptext: any;
  isTipModal: boolean = false;
  paymentMethodList: any = [];
  is_card_ready: boolean = false;
  amount: any = 0;
  notificationType: any;

  bonusTipForm = new FormGroup({
    amount: new FormControl("", Validators.compose([
      Validators.required,
    ])),
    card_id: new FormControl("", Validators.compose([
      Validators.required,
    ])),
  });

  validation_messages = {
    amount: [
      { type: "required", message: "Amount is required." }
    ]
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router,
    private commonService: CommonService,
    private cdref: ChangeDetectorRef
  ) {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params && params.booking_id) {
        this.bookingId = params.booking_id;
        this.notificationType = params.notification_type;
        this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
          if (user != null) {
            this.logUser = user;
            this.getBookingDetails();
            this.getCard(this.logUser);
          }
        });
      }
    });

    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'request_details');
    }
  }

  ngOnInit() {

  }

  getBookingDetails() {
    this.ready = false;
    this.apiService.fetchData(`get_bookingdetails?booking_id=${this.bookingId}`, this.logUser.token).subscribe((res: any) => {
      this.ready = true;
      this.bookingDetails = res.bookings;
      this.cdref.detectChanges();

      // Auto-open bonus tip modal if coming from requestPendingRemainder notification
      if (this.notificationType === 'requestPendingRemainder' && this.bookingDetails?.status == 1) {
        setTimeout(() => {
          this.bonusTipModal(this.bookingDetails);
        }, 500); // Small delay to ensure the page is fully loaded
      }
    }, (err) => {
      console.log("err :", err);
      this.ready = true;
      this.cdref.detectChanges();
    });
  }

  goToSession(data: any) {
    this.router.navigate(['/session-completed'], { state: data });
  }

  goToReport(data: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        bookingData: JSON.stringify({ ...data }),
      }
    }
    this.router.navigate(['/report-session'], parameter)
  }

  goToCancelSession(data: any) {
    console.log("data :", data);
    this.router.navigate(['/cancel-session'], { state: data });
  }

  goToCancelAcceptedSession(data: any) {
    console.log("data:", data);
  }

  bonusTipModal(data: any) {
    this.isTipModal = true;
    this.cdref.detectChanges();
    console.log("data :", data);
  }

  getCard(logUser: any) {
    let body = {
      user_token: logUser.token
    };
    this.is_card_ready = true;
    this.apiService.getSaveCards(body, logUser.token).subscribe((res: any) => {
      if (res.success) {
        this.paymentMethodList.cards = res.cards || [];
      } else {
        this.paymentMethodList.cards = []
      }
      this.is_card_ready = false;
    }, (err: any) => {
      this.is_card_ready = false;
      this.commonService.presentAlert(err?.error?.msg || 'Error fetching payment methods.');
    });
  }

  modalClose(isOpen: boolean) {
    this.isTipModal = isOpen;
    this.cdref.detectChanges();
  }

  addCard() {
    this.modalClose(false);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_name: 'selected-session'
      }
    }
    this.router.navigate(['/add-debit-card'], navigationExtras);
  }

  async submitBonusTipForm(formdata: any) {
    await this.commonService.showLoader();
    formdata.booking_id = this.bookingId;
    await this.apiService.send1('add-bonus-tip', formdata, this.logUser.token).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.modalClose(false);
      this.commonService.presentToast(res.message, 'success');
      this.getBookingDetails();
    }, async (err) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });
  }

  formatAmount() {
    const control = this.bonusTipForm.get('amount');
    if (control && control.value !== null && control.value !== '') {
      const numericValue = parseFloat(control.value);
      if (!isNaN(numericValue)) {
        control.setValue(numericValue.toFixed(2), { emitEvent: false });
        this.amount = numericValue.toFixed(2);
      }
    }
  }

}
