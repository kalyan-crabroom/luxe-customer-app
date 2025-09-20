import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { StorageService } from './services/storage.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { CommonService } from './services/common.service';
import { IpaService } from './services/ipa.service';
import { register } from 'swiper/element/bundle';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { tap } from 'rxjs';
register(); // Register Swiper elements
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  user: any = [];
  totalNotification_count: any = 0;
  logUser: any = []

  constructor(
    private platform: Platform,
    private storageService: StorageService,
    private commonService: CommonService,
    public ipaService: IpaService,
    private router: Router,
    private apiService: ApiService,
    private afMessaging: AngularFireMessaging) {
    defineCustomElements(window);
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {

      if (this.platform.is('capacitor')) {
        await StatusBar.setStyle({ style: Style.Default });
        if (this.platform.is('android')) {
          await StatusBar.setBackgroundColor({ color: '#000026' });
        }
        this.ipaService.products = [];
        await this.ipaService.initialize();
      }

      await SplashScreen.show({
        showDuration: 5000,
        autoHide: true,
      });

      this.getHelperText();

      this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
        if (user != null) {
          this.logUser = user;
          this.getTotalNotification();
          this.apiService.getAppSettings(this.logUser.token);
        }
      });

      if (this.platform.is('desktop') || Capacitor.getPlatform() == 'web') {
        this.requestPermissionPwa();
      } else {
        this.requestPushNotificationsPermissionApp();
      }
      //for gettting app tip and taxes
    });

  }

  requestPermissionPwa() {
    console.log("requestPermissionPwa")
    this.afMessaging.requestToken.pipe(
      tap((token) => {
        console.log("PWA Token:", token);
        if (token) {
          this.commonService.firebase_push_token.next(token);
          if (this.logUser && token) {
            setTimeout(() => {
              this.commonService.save_device_details(this.logUser.token);
            }, 1000);
          }
        }
      })
    ).subscribe({
      next: () => console.log("Permission granted!"),
      error: (err) => console.error("Unable to get permission to notify.", err)
    });
  }

  async requestPushNotificationsPermissionApp() {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.log("PushNotifications error");
      }
    }).catch((err) => {
      console.log("notification permission err:", err);
    });;

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token);
      if (token.value) {
        this.commonService.firebase_push_token.next(token.value);
        if (this.logUser && token?.value) {
          setTimeout(() => {
            this.commonService.save_device_details(this.logUser.token);
          }, 1000);
        }
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        this.getTotalNotification();
        this.apiService.location_refresh.next(1);
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Notification action performed:', notification);
        console.log('Push action performed: ' + JSON.stringify(notification));
        const data = notification.notification.data;
        if (data) {
          console.log('dataApp', data);
          if (data.type === 'newRequestOpportunity') {
            // Navigate to notifications screen for newRequestOpportunity
            this.router.navigate(['/tabs/notifications']);
          } else if (data.type === 'requestAccepted' || data.type === 'completedRequest' || data.type === ' cancellation' || data.type === 'report' ||
            data.tyoe == 'reminder' || data.type == 'requestPending' || data.type == 'sessionReminder'
            || data.type == 'sessionStart' || data.type == 'sessionStart' || data.type == "requestPendingRemainder" || data.type == "cancelledRequest"
          ) {
            const navigationExtras: NavigationExtras = {
              queryParams: {
                booking_id: data.booking_id,
              }
            };
            console.log('Navigation Extras:', navigationExtras);
            this.router.navigate(['/selected-session'], navigationExtras);
          } else if (data.type === 'chat') {
            const navigationExtras: NavigationExtras = {
              queryParams: {
                type: data.type
              }
            };
            console.log('Navigation Extras:', navigationExtras);
            this.router.navigate(['/messages'], navigationExtras);
          }
          else {
            console.log('Notification type not handled:', data.type);
          }
        }
      }
    );
  }

  getTotalNotification() {
    this.apiService.fetchData(`count_unread_notification`, this.logUser.token).subscribe((res: any) => {
      this.totalNotification_count = res.un_read;
      this.commonService.notification_count.next(this.totalNotification_count);
    }, (err: any) => {
      console.log('err', err);
    })
  }

  getHelperText() {
    this.apiService.fetchData(`get-help-text`, this.logUser.token).subscribe((res: any) => {
      console.log("getHelperText res:", res);
      this.storageService.saveToStorage('luxe-customer-help-text', res.data);
      this.commonService.helptext = res.data;
    }, (err: any) => {
      console.log("getHelperText api error :", err);
    });
  }
}