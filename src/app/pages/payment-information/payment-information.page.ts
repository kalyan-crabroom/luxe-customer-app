import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { InAppBrowser } from '@capgo/inappbrowser'
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.page.html',
  styleUrls: ['./payment-information.page.scss'],
})
export class PaymentInformationPage implements OnInit {
  params: any
  logUser: any;
  selectedSegment: string = 'bank';
  paymentMethodList: any = { cards: [], connected_banks: [], account_and_cards : []};
  ready: boolean = false;
  is_history: boolean = false;
  kyc_details: any;
  transactionHistory: any = [];
  connected_account_id: any = '';

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private router: Router,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.params = this.router.getCurrentNavigation()?.extras.state;
      if (this.params.segment) {
        this.selectedSegment = this.params.segment;
      }
    }
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getCard(this.logUser);
        this.getBookingHistory()
      }
    });
  }

  getBookingHistory() {
    const payLoad = {
      token: this.logUser.token,
      status: 'history'
    }
    this.is_history = false;
    this.apiService.send('getBookingByDate', payLoad).subscribe({
      next: (res: any) => {
        console.log('resHistory>>', res);
        this.is_history = true;
        this.transactionHistory = res || [];

      },
      error: (err: any) => {
        this.is_history = true;
      }
    })
  }

  getCard(logUser: any) {
    let body = {
      user_token: logUser.token,
      token: logUser.token
    };
    this.ready = false;
    this.apiService.send("getsavecard", body).subscribe((res: any) => {
      if (res.success) {
        this.paymentMethodList.cards = res.cards || [];
        this.paymentMethodList.connected_banks = res.connected_banks || [];
        this.paymentMethodList.account_and_cards = res.account_and_cards || [];
      } else {
        this.paymentMethodList.cards = [];
        this.paymentMethodList.connected_banks = [];
        this.paymentMethodList.account_and_cards = [];
      }
      this.kyc_details = res.kyc_details;
      this.ready = true;
      this.connected_account_id = res.connected_account_id;
      console.log("connected_account_id :", this.connected_account_id);
      this.cdref.detectChanges();
    }, (err: any) => {
      this.ready = true;
      this.paymentMethodList.cards = [];
      this.paymentMethodList.connected_banks = [];
      this.commonService.presentToast(err?.error?.msg || 'Error fetching payment methods.');
      this.cdref.detectChanges();
    });
  }

  confirmDeleteBank(index: number, bankId: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: "Delete !",
        message: "Are you sure ?",
        buttons: [
          {
            text: 'No',
            handler: () => {

            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.deleteBank(index, bankId);
              console.log('delete');

            }
          }
        ]
      });
      await alert.present();
    })
  }

  deleteBank(index: number, bankId: any) {
    this.commonService.showLoader();
    let payload = {
      bank_id: bankId,
      token: this.logUser.token
    }
    this.apiService.send('deleteBank', payload).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        if (res.success) {
          this.paymentMethodList.connected_banks.splice(index, 1);
          this.commonService.presentToast(res.message, "success");
        } else {
          this.commonService.presentToast(res.message, "danger");
        }
      }, error: (err: any) => {
        this.commonService.dismissLoading();
        if (err?.error?.message) {
          this.commonService.presentAlert(err?.error?.message);
        } else {
          this.commonService.presentAlert("Your card information could not be verified.");
        }
      }
    })
  }

  confirmDeleteAlert(index: number, cardId: any): Promise<any> {
    console.log('delete', cardId);

    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: "Delete !",
        message: "Are you sure ?",
        buttons: [
          {
            text: 'No',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.deleteCard(index, cardId);
            }
          }
        ]
      });
      await alert.present();
    })
  }

  deleteCard(index: number, cardId: any) {
    this.commonService.showLoader();
    let payload = {
      card_id: cardId,
      token: this.logUser.token
    }
    console.log('payload', payload)
    this.apiService.send("deletecard", payload).subscribe({
      next: (res: any) => {
        console.log('resCard', res);

        this.commonService.dismissLoading();
        if (res.success) {
          this.paymentMethodList.cards.splice(index, 1);
          this.commonService.presentToast(res.message, "success");
        } else {
          this.commonService.presentToast(res.message, "danger");
        }
      }, error: (err: any) => {
        this.commonService.dismissLoading();
        if (err?.error?.message) {
          this.commonService.presentAlert(err?.error?.message);
        } else {
          this.commonService.presentAlert("Your card information could not be verified.");
        }
      }
    })
  }

  add(type: any) {
    this.router.navigate(['/add-debit-card'], { state: { type: type, status: this.params?.type, segment: this.selectedSegment } });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async doKyc(kycUrl: any) {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      window.open(kycUrl, '_self');
    } else {
      if (platform == 'ios') {
        InAppBrowser.open({ url: kycUrl });
      } else {
        InAppBrowser.openWebView({ url: kycUrl, title: 'KYC' });
      }
      await InAppBrowser.addListener("urlChangeEvent", async (urlChangeEvent: any) => {
        if (urlChangeEvent.url.includes('payment-information')) {
          await InAppBrowser.close().then(async () => {
            this.getCard(this.logUser);
            await InAppBrowser.clearCookies({ url: kycUrl, cache: true })
            await InAppBrowser.removeAllListeners();
            this.cdref.detectChanges();
          });
        }
      });
    }
  }

  goToNext() {
    this.router.navigate(['completed-appointments'], { state: { transaction_history: 'transaction_history' } })
  }

  goToBooking(item: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: item.id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

  addExpressAccount() {
    this.commonService.showLoader();
    this.apiService.send('create-express-account', { token: this.logUser.token }).subscribe((res: any) => {
      this.commonService.dismissLoading();
      this.doKyc(res.url);
    }, (err) => {
      console.log("err :", err);
      this.commonService.dismissLoading()
    });
  }
}
