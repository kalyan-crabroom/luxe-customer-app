import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
declare var Stripe: any;

@Component({
  selector: 'app-add-debit-card',
  templateUrl: './add-debit-card.page.html',
  styleUrls: ['./add-debit-card.page.scss'],
})
export class AddDebitCardPage implements OnInit {

  newBank!: FormGroup
  cardHolderName: any;
  cardNumber: any;
  cardExpiryDate: any;
  responseMessage: any
  cardCVV: any;
  card: any;
  stripe: any;
  params: any;
  logUser: any;
  receivedData: any
  navigateTo: any
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
  pre_page: any;
  appSettingDetails:any;
  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private modalController: ModalController,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute
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

    this.route.queryParams.subscribe((params: any) => {
      console.log("params :", params)
      if (params.page_name == 'select-membership') {
        this.navigateTo = 'select-membership'
        this.pre_page = params.pre_page
      } else if (params.page_name == 'checkout') {
        this.navigateTo = 'checkout'
      } else if (params.page_name == 'wallet') {
        this.navigateTo = 'wallet'
      }
      else if (params.page_name == 'add-gift-card') {
        this.navigateTo = 'add-gift-card'
      }
      else if (params.page_name == 'selected-session') {
        this.navigateTo = 'selected-session'
      } else {
        this.navigateTo = 'payment-information'
      }
    });

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });
  }

  ionViewWillEnter() {

    this.apiService.appSettingDetails.subscribe((appsetting: any) => {
      if (appsetting) {
        this.appSettingDetails = appsetting;
        console.log("AppSettingDetails:", this.appSettingDetails);
      }
    });

    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe(this.appSettingDetails?.stripe_pk_key);
      this.setupStripe();
    } else {
      console.error('Stripe has not been loaded yet.');
      this.loadStripe().then(() => {
        this.stripe = Stripe(this.appSettingDetails?.stripe_pk_key);
        this.setupStripe();
      });
    }
  }

  loadStripe() {
    return new Promise<void>((resolve) => {
      if (document.querySelector('#stripe-js')) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.id = 'stripe-js';
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => resolve();
        document.body.appendChild(script);
      }
    });
  }

  setupStripe() {
    const elements = this.stripe.elements();
    var style = {
      base: {
        iconColor: '#666EE8',
        color: '#fff',
        lineHeight: '40px',
        fontWeight: 300,
        fontSize: '16px',
        margin: '10px',
        marginBottom: '10px',
        borderRadius: '7px',
        padding: '50px'
      },
    };
    this.card = elements.create('cardNumber', {
      style: style,
      placeholder: 'Card Number',
    });
    this.card.mount('#card-number-element');

    this.card = elements.create('cardExpiry', {
      style: style,
      placeholder: 'Expiration Date (MM/YYYY)',
    });
    this.card.mount('#card-expiry-element');

    this.card = elements.create('cardCvc', {
      style: style,
      placeholder: 'CSV',
    });
    this.card.mount('#card-cvc-element');
  }


  async onSubmit() {
    await this.commonService.showLoader();
    await this.stripe.createToken(this.card, { name: this.cardHolderName, currency: 'usd' }).then(async (resp: any) => {
      if (resp?.error?.message) {
        await this.commonService.dismissLoading();
        this.commonService.presentAlert(resp?.error?.message);
        return;
      }
      let body = {
        name: this.cardHolderName,
        email: this.logUser.email,
        token: resp?.token?.id,
      }
      this.apiService.send("save-card", body).subscribe({
        next: async (resp: any) => {
          console.log('resp', resp);
          if (resp.success) {
            this.responseMessage = resp.msg;
            document.getElementById("success-modal")?.click();
            await this.commonService.dismissLoading();
          }
          this.cardHolderName = '';
        },
        error: async (err: any) => {
          await this.commonService.dismissLoading();
          if (err?.error?.message) {
            this.commonService.presentAlert(err?.error?.message);
          } else {
            this.commonService.presentAlert("Your card information could not be verified.");
          }
        }
      })
    }).catch(async (err: any) => {
      await this.commonService.dismissLoading();
      this.commonService.presentToast("Something went wrong, Please try after sometimes", "warning");
    })
  }

  async dismissModal() {
    await this.modalController.dismiss();
    if (this.navigateTo == 'checkout') {
      this.router.navigate(['/checkout']);
    } else if (this.navigateTo == 'select-membership') {
      let parameter: NavigationExtras = {
        queryParams: {
          page: this.pre_page
        }
      };
      this.router.navigate(['/select-membership'], parameter);
    } else if (this.navigateTo == 'wallet') {
      this.router.navigate(['/wallet']);
    } else if (this.navigateTo == 'add-gift-card') {
      this.router.navigate(['/add-gift-card']);
    } else if (this.navigateTo == 'selected-session') {
      this.router.navigate(['/selected-session']);
    } else {
      this.router.navigate(['/payment-information']);
    }
  }

  ionViewWillLeave() {
    this.navigateTo = undefined;
  }
}
