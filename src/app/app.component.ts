import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { CommonService } from './services/common.service';
import { Capacitor } from '@capacitor/core';
import { register } from 'swiper/element/bundle';
import { NavigationExtras, Router } from '@angular/router';
import { StorageService } from './services/storage.service';
import { ApiService } from './services/api.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { tap } from 'rxjs';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
register();
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
    private commonService: CommonService,
    private router: Router,
    private storageService: StorageService,
    private apiService: ApiService,
    private afMessaging: AngularFireMessaging
  ) {
    defineCustomElements(window);
    this.initializeApp();
    this.commonService.notification_count.subscribe((data: any) => {
      if (data) {
        console.log('getTotal', this.totalNotification_count);
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      if (this.platform.is('capacitor')) {
        await StatusBar.setStyle({ style: Style.Default });
        if (this.platform.is('android')) {
          await StatusBar.setBackgroundColor({ color: '#000026' });
        }
      }
      await SplashScreen.show({
        showDuration: 5000,
        autoHide: true,
      });

      this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
        if (user != null) {
          this.logUser = user;
          this.getHelperText(this.logUser.token);
          this.getTotalNotification();
          this.apiService.getAppSettings(this.logUser.token);
        }
      });

      if (this.platform.is('desktop') || Capacitor.getPlatform() == 'web') {
        this.requestPermissionPwa();
      } else {
        this.requestPushNotificationsPermissionApp();
      }
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

  // async requestPushNotificationsPermissionApp() {
  //   PushNotifications.requestPermissions().then(result => {
  //     if (result.receive === 'granted') {
  //       PushNotifications.register();
  //     } else {
  //       console.log("PushNotifications error");
  //     }
  //   }).catch((err)=>{
  //     console.log("notification permission err:",err);
  //   });

  //   PushNotifications.addListener('registration', (token: Token) => {
  //     console.log('Push registration success, token: ' + token);
  //     if (token.value) {
  //       this.commonService.firebase_push_token.next(token.value);
  //       if (this.logUser && token?.value) {
  //         setTimeout(() => {
  //           this.commonService.save_device_details(this.logUser.token);
  //         }, 1000);
  //       }
  //     }
  //   });

  //   PushNotifications.addListener('registrationError', (error: any) => {
  //     console.log('Error on registration: ' + JSON.stringify(error));
  //   });

  //   // PushNotifications.addListener(
  //   //   'pushNotificationReceived',
  //   //   (notification: PushNotificationSchema) => {
  //   //     console.log('notification', notification)
  //   //     console.log('Push received: ' + JSON.stringify(notification));
  //   //   },
  //   // );


  //   PushNotifications.addListener(
  //     'pushNotificationActionPerformed',
  //     (notification: ActionPerformed) => {
  //       console.log('Notification action performed:', notification);
  //       console.log('Push action performed: ' + JSON.stringify(notification));

  //       const data = notification.notification.data;
  //       if (data) {
  //         console.log('dataApp', data);
  //         // licensureStatus
  //         if (data.type === 'newRequestOpportunity' || data.type === 'therapistAssigned' || data.type === ' cancellation' || data.type === 'report' ||
  //           data.tyoe == 'reminder' || data.type == 'newRequestOpportunity' || data.type == 'requestPending' 
  //           || data.type == 'sessionReminder' || data.type == 'sessionStart' || data.type == 'sessionStart' 
  //           || data.type == "requestPendingRemainder") {
  //           const navigationExtras: NavigationExtras = {
  //             queryParams: {
  //               booking_id: data.booking_id,
  //             }
  //           };
  //           console.log('Navigation Extras:', navigationExtras);
  //           this.router.navigate(['/selected-session'], navigationExtras);
  //         } else if (data.type === 'licensureStatus') {
  //           // Navigate to tab2 if type is 'licensureStatus'
  //           this.router.navigate(['/tabs/profile']);
  //         }
  //         else if (data.type === 'chat') {
  //           const navigationExtras: NavigationExtras = {
  //             queryParams: {
  //               type: data.type
  //             }
  //           };
  //           console.log('Navigation Extras:', navigationExtras);
  //           this.router.navigate(['/messages'], navigationExtras);
  //         }
  //         else {
  //           console.log('Notification type not handled:', data.type);
  //         }
  //       }
  //     }
  //   );
  // }

  async requestPushNotificationsPermissionApp() {
    const platformReady = this.platform.ready();

    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.log("PushNotifications permission not granted");
      }
    }).catch((err) => {
      console.log("notification permission error:", err);
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      if (token.value) {
        this.commonService.firebase_push_token.next(token.value);
        if (this.logUser) {
          setTimeout(() => {
            this.commonService.save_device_details(this.logUser.token);
          }, 1000);
        }
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', async (notification: ActionPerformed) => {
      console.log('Notification action performed:', notification);

      const data = notification.notification.data;
      if (!data) return;

      await platformReady; // Wait for platform to be ready before navigating

      console.log('dataApp', data);
      const type = (data.type || '').trim();

      if (
        type === 'newRequestOpportunity' ||
        type === 'therapistAssigned' ||
        type === 'cancellation' ||
        type === 'report' ||
        type === 'reminder' ||
        type === 'requestPending' ||
        type === 'sessionReminder' ||
        type === 'sessionStart' ||
        type === 'requestPendingRemainder' ||
        type == "bonus_tip"
      ) {
        const navigationExtras: NavigationExtras = {
          queryParams: {
            booking_id: data.booking_id,
          }
        };
        console.log('Navigation to /selected-session', navigationExtras);
        this.router.navigate(['/selected-session'], navigationExtras);

      } else if (type === 'licensureStatus') {
        this.router.navigate(['/tabs/profile']);

      } else if (type === 'chat') {
        const navigationExtras: NavigationExtras = {
          queryParams: {
            type: data.type,
          }
        };
        this.router.navigate(['/messages'], navigationExtras);

      } else {
        console.warn('Unhandled notification type:', type);
      }

      this.getTotalNotification();
      this.commonService.refresh_home.next(1);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Notification received:', notification);
        console.log('Push received: ' + JSON.stringify(notification));
        // Call necessary methods on push receive
        this.getTotalNotification();
        this.commonService.refresh_home.next(1);
      }
    );
  }

  getTotalNotification() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.apiService.fetchData(`count_unread_notification`, this.logUser.token).subscribe((res: any) => {
          console.log('resNotification', res);
          this.totalNotification_count = res.un_read;
          console.log('totalNotification', this.totalNotification_count);
          this.commonService.notification_count.next(this.totalNotification_count);
        }, (err) => {
          console.log("err :", err);
        });
      }
    });
  }

  getHelperText(token: any) {
    this.apiService.fetchData(`get-help-text`, token).subscribe((res: any) => {
      this.storageService.saveToStorage('luxe-customer-help-text', res.data);
      this.commonService.helptext = res.data;
      console.log("helptext :", this.commonService.helptext);
    }, (err: any) => {
      console.log("getHelperText api error :", err);
    });
  }
}
