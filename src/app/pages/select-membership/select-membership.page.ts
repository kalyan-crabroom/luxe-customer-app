import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { EventsService } from 'src/app/services/events.service';
import { IpaService } from 'src/app/services/ipa.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-select-membership',
  templateUrl: './select-membership.page.html',
  styleUrls: ['./select-membership.page.scss'],
})
export class SelectMembershipPage implements OnInit {
  receivedData: any;
  selectedCard: any;
  therapist_id: any;
  products: any = [];
  logUser: any = [];
  getSubscriptionData: any = [];
  order_status: boolean = false;
  is_loader: boolean = false;
  helptext: any;
  is_loader_pwa: boolean = false;
  pwa_subscriptions: any = [];
  platform: any;
  platform_native: any;
  ready: boolean = false;
  paymentMethodList: any = [];
  selectedPaymentMethodId: any;
  bookingData: any = {};
  pre_page: any;
  constructor(
    public event: EventsService,
    private route: ActivatedRoute,
    private router: Router,
    public ipaService: IpaService,
    public common: CommonService,
    private storageService: StorageService,
    public api: ApiService,
    public cdref: ChangeDetectorRef,
    public alertCtrl: AlertController,
    private activatedRoute: ActivatedRoute,

  ) {
    this.helptext = this.common.helptext.find((res: any) => res.page_name == 'select_membership');
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params && params.page) {
        this.pre_page = params.page;
        console.log("pre_page :", this.pre_page);
      }
    });
  }

  async ngOnInit() {
    if (Capacitor.getPlatform() == 'web') {
      this.getPwaSubscription();
      this.platform = 'web';
    } else {
      this.platform = 'native';
      this.platform_native = Capacitor.getPlatform();
      await this.loadProducts();
    }
  }

  ionViewWillEnter() {
    this.order_status = false;
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        if (Capacitor.getPlatform() == 'web') {
          this.getPwaSubscription();
          this.platform = 'web';
          this.getCard(this.logUser);
        }
        this.getPurchaseSubscription();
      }
    });

    this.storageService.getFromStorage('bookingData').then((data: any) => {
      if (data) {
        this.bookingData = data;
        console.log("bookingData:", this.bookingData);
      }
    });
  }

  async loadProducts() {

    this.storageService.getFromStorage('deeplyCalm:user').then(async (user: any) => {
      if (user != null) {
        this.logUser = user;
        this.products = [];
        let sub_details: any = await this.getAppSettings(this.logUser.token);
        const products = await this.ipaService.getProducts();
        if (products.length > 0) {
          products.forEach((element: any) => {
            if (element.id === 'com.member.plus') {
              element.description = (sub_details.member_plus_desc) ? sub_details.member_plus_desc : ''
              if (Capacitor.getPlatform() == 'ios') {
                element.details = [
                  // 'Priority Customer Support',
                  // '12 month commitment',
                  'Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.', "Account will be charged for renewal within 24-hours prior to the end of the current period, and identify the cost of the renewal.",
                  "Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase."
                ];
              } else {
                element.details = [
                  // 'Priority Customer Support',
                  // '12 month commitment',
                  // 'Your account will be charged automatically after the trial period.',
                  'Cancelable at any time from Play Store.'
                ];
              }
            } else if (element.id === 'com.member.normal') {
              element.description = (sub_details.member_normal_desc) ? sub_details.member_normal_desc : ''
              if (Capacitor.getPlatform() == 'ios') {
                element.details = [
                  // '2 month commitment',
                  'Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.', "Account will be charged for renewal within 24-hours prior to the end of the current period, and identify the cost of the renewal.",
                  "Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase."
                ];
              } else {
                element.details = [
                  // '2 month commitment',
                  // 'Your account will be charged automatically after the trial period.',
                  'Cancelable at any time from Play Store.'
                ];

              }
            }
            this.products.push(element);
          });
          this.products.reverse();
          console.log("app store products :", this.products);
        }
      }
    });

  }

  selectOption(id: any) {
    this.selectedCard = id;
  }

  async continue() {
    this.api.location_refresh.next(1);
    let key = '';
    if (this.selectedCard === 'com.member.plus') {
      key = 'memberPlus';
    } else if (this.selectedCard === 'com.member.normal') {
      key = 'member';
    }
    if (this.pre_page == 'home') {
      this.router.navigate(['/tabs/home']);
    } else if (this.pre_page == 'checkout') {
      this.bookingData.product_id = this.selectedCard;
      await this.storageService.saveToStorage('bookingData', this.bookingData);
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/tabs/home']);
    }
  }

  getPurchaseSubscription() {
    this.is_loader = true;
    let platform = Capacitor.getPlatform();
    console.log("platform :", platform);
    this.api.fetchData('get-subscription-by-user?platform=' + platform, this.logUser.token).subscribe(
      (res: any) => {
        console.log('Subscription Response:', res);
        const subscriptionData = res.data;
        if (subscriptionData.subscription_status === 'active') {
          if (Capacitor.getPlatform() == 'web') {
            this.getSubscriptionData = subscriptionData
            this.updatePwaSubscriptionStatus();
          } else {
            this.getSubscriptionData = subscriptionData
            this.updateProductSubscriptionStatus();
          }
        } else {
          this.getSubscriptionData = null;
          this.updatePwaSubscriptionStatus();
          this.updateProductSubscriptionStatus();
        }
        this.is_loader = false;
        this.cdref.detectChanges();
        console.log("getSubscriptionData :", this.getSubscriptionData);
      },
      (err: any) => {
        console.log('Error fetching subscription data:', err);
        this.is_loader = false;
      }
    );
  }

  updateProductSubscriptionStatus() {
    this.products.forEach((product: any) => {
      product.isSubscribed = this.getSubscriptionData?.product_id === product.id;
      product.purchase_platform = this.getSubscriptionData?.purchase_platform;
    });
    this.cdref.detectChanges();

  }

  updatePwaSubscriptionStatus() {
    this.pwa_subscriptions.forEach((item: any) => {
      item.isSubscribed = this.getSubscriptionData?.product_id === item.id;
      item.purchase_platform = this.getSubscriptionData?.purchase_platform;
    });
    this.cdref.detectChanges();
  }

  async purchase_subscription() {
    await this.common.showLoader();
    const productToOrder: any = CdvPurchase.store.get(this.selectedCard);
    console.log("productToOrder :", productToOrder);
    try {
      const order = await productToOrder.getOffer().order();
      this.order_status = true;
      this.setupListener(order);
    } catch (exception: any) {
      await this.common.dismissLoading();
      this.common.presentAlert(exception.message);
    }
  }

  setupListener(order: any) {
    CdvPurchase.store.when().approved((product: any) => {
      console.log('APPROVED:', product);
      if (product.products && product.products[0] && this.order_status) {
        product.finish();
        return;
      }
      if (product.state === 'approved') {
        product.verify();
      }
    }).verified((product: any) => {
      console.log('VERIFIED:', product);
      product.finish();
    }).finished(async (f: any) => {
      console.log('FINISHED:', f);
      if (f.transactionId) {
        if (this.order_status) {
          f.transaction_id = f.transactionId;
          f.product_id = f.products[0].id;
          this.savePurchasedIos(f);
        }
      } else {
        await this.common.dismissLoading();
        console.log('TransactionId not found!');
      }
    }).unverified((err: any) => {
      this.order_status = false;
      console.error('Unverified:', err);
    });
  }

  savePurchasedIos(data: any) {
    data.token = this.logUser?.token;
    data.receiptData = Capacitor.getPlatform() == 'ios' ? data?.parentReceipt?.nativeData?.appStoreReceipt : data?.purchaseId;
    data.platform = Capacitor.getPlatform();
    console.log('Saving Purchased iOS Data:', data);
    this.api.send('validateReceipt', data).subscribe(
      (res: any) => {
        console.log('Subscription Validation Response:', res);
        this.common.dismissLoading();
        this.common.presentToast(res.message, 'success');
        this.order_status = false;
        this.continue();
      },
      (err: any) => {
        this.common.dismissLoading();
        console.log('Error validating subscription:', err);
        this.common.presentAlert(err?.error?.message);
      }
    );
  }

  isProductSubscribed(productId: any): boolean {
    return this.getSubscriptionData?.product_id === productId;
  }

  getPwaSubscription() {
    this.is_loader_pwa = true;
    this.api.get('getSubscriptions').subscribe((res: any) => {
      console.log(res);
      this.is_loader_pwa = false;
      this.pwa_subscriptions = res;
      this.pwa_subscriptions;
    }, (err) => {
      console.log("err :", err);
      this.is_loader_pwa = false;
    });
  }

  selectPwaOption(id: any) {
    this.selectedCard = id;
  }

  selectCard(event: any) {
    this.selectedPaymentMethodId = event.target.value;
    this.cdref.detectChanges();
  }

  async purchasePwaSubscription() {
    await this.common.showLoader("Please waitt...");
    let payload = {
      token: this.logUser.token,
      price_id: this.pwa_subscriptions.find((res: any) => res.id == this.selectedCard).price_id,
      payment_method_ID: this.selectedPaymentMethodId
    }
    console.log("payload:", payload);
    this.api.send('purchase-subscription', payload).subscribe(async (res: any) => {
      console.log("res :", res);
      await this.common.dismissLoading();
      this.common.presentAlert(res.message);
      this.continue();
    }, async (err) => {
      console.log("err :", err);
      await this.common.dismissLoading();
      this.common.presentAlert(err.error.message);
    });
  }

  getCard(logUser: any) {
    let body = {
      user_token: logUser.token
    };
    this.ready = false;
    this.api.getSaveCards(body, logUser.token).subscribe((res: any) => {
      if (res.success) {
        this.paymentMethodList.cards = res.cards || [];
      } else {
        this.paymentMethodList.cards = []
      }
      this.ready = true;
    }, (err: any) => {
      this.ready = true;
      this.common.presentAlert(err?.error?.msg || 'Error fetching payment methods.');
    });
  }

  goDebitCard() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_name: 'select-membership',
        pre_page: this.pre_page
      }
    }
    this.router.navigate(['/add-debit-card'], navigationExtras);
  }


  async cancelSubscription(id: any) {
    let alert = await this.alertCtrl.create({
      header: "Cancel Subscription!",
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
          handler: async () => {
            await this.common.showLoader('Please wait...');
            this.api.send('cancel-subscription', { token: this.logUser.token, price_id: id }).subscribe(async (res: any) => {
              await this.common.dismissLoading();
              this.common.presentAlert(res.message);
              this.getPurchaseSubscription();
            }, async (err) => {
              console.log("err :", err);
              await this.common.dismissLoading();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getAppSettings(token: any) {
    return new Promise((resolve, reject) => {
      this.api.fetchData('getAppSetting', token).subscribe((res) => {
        resolve(res.data);
      }, (err: any) => {
        reject(false);
      });
    });
  }
}
