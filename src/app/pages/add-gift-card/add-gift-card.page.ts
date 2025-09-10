import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-add-gift-card',
  templateUrl: './add-gift-card.page.html',
  styleUrls: ['./add-gift-card.page.scss'],
})
export class AddGiftCardPage implements OnInit {

  addGiftCardForm: FormGroup = new FormGroup({
    name: new FormControl("", Validators.compose([Validators.required])),
    amount: new FormControl('', Validators.compose([Validators.required])),
    recipient_name: new FormControl("", Validators.required),
    recipient_email: new FormControl("", [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')
    ]),
    description: new FormControl('', Validators.compose([Validators.required])),
    schedule_delivery_date: new FormControl(),
    card_id: new FormControl('', Validators.compose([Validators.required])),
  });

  validation_messages = {
    name: [
      { type: 'required', message: "Gift Card Name is required." },
    ],
    recipient_name: [
      { type: 'required', message: "Recipient Name is required." },
    ],
    recipient_email: [
      { type: 'required', message: "Recipient Email is required." },
      { type: "pattern", message: "Enter a valid email." }
    ],
    description: [
      { type: 'required', message: 'Message is required.' }
    ],
    amount: [
      { type: 'required', message: "Amount is required." },
    ],
  }
  ready: boolean = false;
  paymentMethodList: any = [];
  logUser: any = [];
  isDateModal: boolean = false;
  schedule_date: any = "";
  minDate: any = new Date().toISOString();

  constructor(
    public cdref: ChangeDetectorRef,
    public apiService: ApiService,
    public commonService: CommonService,
    public storageService: StorageService,
    public router: Router
  ) {
    this.paymentMethodList.cards = []
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getCard(this.logUser);
      }
    });
  }

  getCard(logUser: any) {
    this.ready = true;
    this.apiService.getSaveCards({ user_token: logUser.token }, logUser.token).subscribe((res: any) => {
      if (res.success) {
        this.paymentMethodList.cards = res.cards || [];
      } else {
        this.paymentMethodList.cards = []
      }
      this.ready = false;
    }, (err: any) => {
      this.ready = false;
      this.commonService.presentAlert(err?.error?.msg || 'Error fetching payment methods.');
    });
  }

  addCard() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_name: 'add-gift-card'
      }
    }
    this.router.navigate(['/add-debit-card'], navigationExtras);
  }

  onSubmit(data: any) {
    data.date = moment(data.schedule_delivery_date).format('MM/DD/YYYY');
    console.log("data :", data);
    this.commonService.showLoader("Please wait");
    this.apiService.send1('add-gift-card', data, this.logUser.token).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.commonService.presentToast(res.message, 'success');
      this.router.navigate(['/gift-cards']);
    }, async (err) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });
  }

  openDateModal(is_open: boolean) {
    this.isDateModal = is_open
  }

  async onDateSelected(event: any) {
    this.schedule_date = moment(event.detail.value).format('MM/DD/YYYY');
  }
}
