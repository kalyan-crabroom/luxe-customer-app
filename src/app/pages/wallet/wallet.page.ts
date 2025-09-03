import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  isWalletModel: boolean = false;
  ready: boolean = false;
  paymentMethodList: any = [];
  logUser: any = [];
  is_wallet_ready: boolean = false;
  wallet_amount: any = 0.00;
  wallet_log: any = [];

  walletForm = new FormGroup({
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
    public cdref: ChangeDetectorRef,
    public apiService: ApiService,
    public commonService: CommonService,
    public storageService: StorageService,
    public router: Router
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter(){
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getCard(this.logUser);
        this.getWalletDetails();
      }
    });
  }

  openModel(isOpen: boolean) {
    this.isWalletModel = isOpen;
    this.cdref.detectChanges();
  }

  getCard(logUser: any) {
    let body = {
      user_token: logUser.token
    };
    this.ready = true;
    this.apiService.getSaveCards(body, logUser.token).subscribe((res: any) => {
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

  getWalletDetails() {
    this.is_wallet_ready = true;
    this.apiService.fetchData('walletDetails', this.logUser.token).subscribe((res: any) => {
      this.wallet_amount = res.wallet_amount;
      this.wallet_log = res.wallet_log;
      this.is_wallet_ready = false;
    }, (err: any) => {
      this.is_wallet_ready = false;
    });
  }

  async onSubmit(data: any) {
    await this.commonService.showLoader();
    await this.apiService.send1('walletTopUp', data, this.logUser.token).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.getWalletDetails();
      this.wallet_amount = res.wallet_amount;
      this.openModel(false);
      this.commonService.presentToast(res.message, 'success');
      this.apiService.location_refresh.next(1);
    }, async (err) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });
  }

  addCard() {
    this.openModel(false);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_name: 'wallet'
      }
    }
    this.router.navigate(['/add-debit-card'], navigationExtras);
  }

}
