import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';
declare var Stripe: any;
@Component({
  selector: 'app-add-bank-account',
  templateUrl: './add-bank-account.page.html',
  styleUrls: ['./add-bank-account.page.scss'],
})
export class AddBankAccountPage implements OnInit {
  newBank!: FormGroup
  responseMessage: any
  logUser: any = []
  stripe: any;
  isModalOpen: boolean = false;
  appSettingDetails: any;
  validation_messages = {
    account_holder_name: [
      { type: "required", message: "Account holder name is required" },
      { type: "pattern", message: "Enter a valid email." }
    ],
    account_number: [
      { type: "required", message: "Account number is required" },
      { type: 'minlength', message: "Minimum 12 digit are allowed" }
    ],
    routing_number: [
      { type: "required", message: "Routing number is required" },
      { type: 'minlength', message: "Minimum 9 digit are allowed" }
    ]
  };
  constructor(
    private commonService: CommonService,
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router,
    private modalController: ModalController
  ) {
    this.newBank = new FormGroup({
      account_holder_name: new FormControl("", Validators.compose([
        Validators.required
      ])),
      account_number: new FormControl("", Validators.compose([
        Validators.required,
        Validators.minLength(12)
      ])),
      routing_number: new FormControl("", Validators.compose([
        Validators.required,
        Validators.minLength(9)
      ])),
    })
  }

  ngOnInit() {

    this.apiService.appSettingDetails.subscribe((appsetting: any) => {
      if (appsetting) {
        this.appSettingDetails = appsetting;
        console.log("AppSettingDetails:", this.appSettingDetails);
        this.stripe = Stripe(this.appSettingDetails?.stripe_pk_key);
      }
    });

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });
  }

  ionViewWillEnter() {
  }

  addNewBank(data: any) {
    this.commonService.showLoader();
    data.country = 'US';
    data.currency = 'usd';
    data.account_holder_type = 'individual'
    this.stripe.createToken('bank_account', data).then((resp: any) => {
      if (resp?.error?.message) {
        this.commonService.dismissLoading();
        this.commonService.presentToast(resp?.error?.message, 'danger');
        return;
      }
      const body = {
        token: this.logUser.token,
        bank_token: resp?.token?.id,
        account_id: resp?.token?.bank_account?.id
      }
      this.apiService.send('Add-BankAccount', body).subscribe({
        next: (resp: any) => {
          console.log('res', resp);

          this.commonService.dismissLoading();
          this.responseMessage = resp.message;

          document.getElementById("success-modal")?.click();

        }, error: (error: any) => {
          this.commonService.dismissLoading();
          if (error?.error?.message) {
            this.commonService.presentAlert(error?.error?.message);
          } else {
            this.commonService.presentAlert("Something went wrong, Please try after sometimes");
          }
        }
      })
    }).catch((err: any) => {
      this.commonService.dismissLoading();
      this.commonService.presentToast("Something went wrong, Please try after sometimes", "danger")
    })
  }
  async dismissModal() {
    await this.modalController.dismiss();
  }
}
