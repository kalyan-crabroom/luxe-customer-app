import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import 'cordova-plugin-purchase';
import { EventsService } from './events.service';
import { CommonService } from './common.service';

declare var CdvPurchase: any;

@Injectable({
  providedIn: 'root'
})
export class IpaService {
  plans = ['com.member.plus', 'com.member.normal'];
  products: any = [];
  constructor(
    private platform: Platform,
    public apiService: ApiService,
    public common: CommonService,
    public event: EventsService
  ) { }

  registerProducts() {
    return new Promise<void>((resolve, reject) => {
      this.plans.forEach(productId => {
        CdvPurchase.store.register([{
          id: productId,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: CdvPurchase.store.defaultPlatform(),
        }]);
      });

      resolve();
    })
  }

  getProducts(): Promise<CdvPurchase.Product[]> {
    return new Promise<CdvPurchase.Product[]>((resolve) => {
      resolve(CdvPurchase.store.products);
      this.products = CdvPurchase.store.products;
    });
  }


  setupListeners() {
    return new Promise<void>((resolve, reject) => {
      CdvPurchase.store.when()
        .approved((transaction: CdvPurchase.Transaction) => {
          transaction.verify();
        })
        .finished((transaction: CdvPurchase.Transaction) => {
          // this.event.publish('receiptUpdated', transaction);
          transaction.finish();
        })
        .pending((transaction: any) => {
          transaction.verify();
        })
        .productUpdated((product: any) => {

        })
        .receiptUpdated((recepit: any) => {

        })
        .receiptsReady((receipt: any) => {

        })
        .receiptsVerified((receipt: any) => {
        })
        .unverified((receipt: any) => {

        })
        .verified((receipt: CdvPurchase.VerifiedReceipt) => {
          receipt.finish();
          // this.purchaseSuccessCallback(receipt);
        });

      CdvPurchase.store.error((error: any) => {
        this.common.dismissLoading()
        console.error("in app store error", error);
        this.common.presentToast(error?.message,'danger')
      });
      resolve()

    });

  }

  initialize() {
    this.platform.ready().then(() => {
      CdvPurchase.store.verbosity = CdvPurchase.LogLevel.DEBUG;
      CdvPurchase.store.ready(() => {
      });

      this.setupListeners();
      this.registerProducts();

      CdvPurchase.store.initialize().then((error: any) => {
        console.error("InAppStoreService initialize then error", error);
      }).catch((error: any) => {
        console.error("InAppStoreService initialize catch error", error);
      });

    });
  }
}
