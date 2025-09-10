import { ChangeDetectorRef, Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { ApiService } from '../services/api.service';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { NavController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  logUser: any
  type: any = 'home'
  bookingData: any = []
  showSpinner: number = 0;
  ready: boolean = false;
  fetching: any;
  wallet_amount: any = 0.00;
  subscriptionDetails: any;
  is_sub: boolean = false;
  homeData:any;

  is_spinner: boolean = true;
  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router,
    private cdref: ChangeDetectorRef,
    private common: CommonService,
    private navCtrl: NavController,
    private platform: Platform,
  ) {
    this.apiService.location_refresh.subscribe((res: any) => {
      if (res) {
        this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
          this.logUser = user;
          this.getBookingDetails();
          this.getPurchaseSubscription();
        });
      }
    });

    //Storage refresh for image
    this.storageService.refresh_storage.subscribe((data: any) => {
      if (data) {
        this.storageService.getFromStorage('deeplyCalm:user').then((userD: any) => {
          this.logUser = userD;
          this.getBookingDetails();
        });
      }
    });

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getBookingDetails();
        this.getPurchaseSubscription();
        this.apiService.getAppSettings(this.logUser.token);
      }
    });
  }


  async ionViewWillEnter() {
    this.getHomeContent();
    if (this.platform.is('android')) {
      await StatusBar.setBackgroundColor({ color: '#000026' });
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url == "/tabs/home") {
           this.getHomeContent();
          this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
            if (user != null) {
              this.logUser = user;
              this.getBookingDetails();
              this.getPurchaseSubscription();
              this.apiService.getAppSettings(this.logUser.token);
            }
          });
        }
      }
    });
  }

  getBookingDetails(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    this.ready = false;
    this.apiService.fetchData(`get-userbooking?type=${this.type}`, this.logUser.token).subscribe((res: any) => {
      this.ready = true;
      this.showSpinner = 2;
      if (res.bookings) {
        this.bookingData = res.bookings
      } else {
        this.bookingData = [];
      }

      console.log("bookingData :", this.bookingData);
      this.wallet_amount = res.wallet_amount ? parseFloat(res.wallet_amount) : 0.00;
      if (event) {
        event.target.complete();
      }
      this.cdref.detectChanges();
    }, (err: any) => {
      this.ready = true;
      this.showSpinner = 2;
      if (event) {
        event.target.complete();
      }
      if (err.error.error_code == 'token_expired') {
        this.storageService.removeFromStorage('deeplyCalm:user');
        this.navCtrl.navigateRoot(['/login']);
      }
      this.common.presentToast(err.error.message, 'danger');
    });
  }

  goToNext(id: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

  handleRefresh(event: any) {
    this.getBookingDetails(event);
    this.getPurchaseSubscription();
  }

  goToSubscriptionPage() {
    let parameter: NavigationExtras = {
      queryParams: {
        page: 'home'
      }
    };
    this.router.navigate(['/select-membership'], parameter);
  }

  getPurchaseSubscription() {
    this.is_sub = true;
    let platform = Capacitor.getPlatform();
    this.apiService.fetchData('get-subscription-by-user?platform=' + platform, this.logUser.token).subscribe(
      (res: any) => {
        console.log('Subscription Response:', res);
        this.subscriptionDetails = res.data;
        this.is_sub = false;
        this.cdref.detectChanges();
      },
      (err: any) => {
        this.is_sub = false;
        console.log('Error fetching subscription data:', err);
      }
    );
  }

  goToGiftCard() {
    this.navCtrl.navigateForward(['/gift-cards']);
  }

  getHomeContent() {
    this.is_spinner = true;
    this.apiService.get('pages').subscribe((res: any) => {
      this.is_spinner = false;
      if (res.data && res.data.length > 0) {
        const home = res.data.find((page: any) => page.slug === 'home');
        this.homeData = home ? home : null;
      } else {
        this.homeData = null;
      }
    }, (err: any) => {
      this.is_spinner = false;
      this.homeData = null;
    });
  }
}
