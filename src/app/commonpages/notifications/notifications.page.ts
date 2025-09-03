import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  logUser: any
  notificationData: any = []
  page: number = 1;
  showSpinner: number = 0;
  fetching: any;
  total_notifications: number = 0
  totalNotification_count: any
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private storageService: StorageService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {

    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      this.logUser = user;
      console.log('user', this.logUser.token)
      this.getNotifications()
    });

  }

  // getNotifications(event: any = null) {
  //   if (event) {
  //     this.showSpinner = 3;
  //   } else {
  //     this.showSpinner = 1;
  //   }
  //   if (this.fetching) {
  //     this.fetching.unsubscribe();
  //   }
  //   this.fetching = this.apiService.fetchData(`get-therapist-notifiaction-by-id?page=${this.page}`, this.logUser.token).subscribe({
  //     next: (res: any) => {
  //       this.showSpinner = 2;
  //       if (event) {
  //         event.target.complete();
  //       }

  //       if (event && this.page === 1) {
  //         this.notificationData = res.data.data;
  //       } else {
  //         this.notificationData = [...this.notificationData, ...res.data.data];
  //       }
  //       this.total_notifications = res.total;
  //     },
  //     error: (err: any) => {
  //       this.showSpinner = 2;
  //       if (event) {
  //         event.target.complete();
  //       }
  //     }
  //   });
  // }

  getNotifications(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }

    if (this.fetching) {
      this.fetching.unsubscribe();
    }

    this.fetching = this.apiService.fetchData(`get-therapist-notifiaction-by-id?page=${this.page}`, this.logUser.token).subscribe((res: any) => {
      this.showSpinner = 2;
      if (event) {
        event.target.complete();
      }

      if (res && res.data && Array.isArray(res.data.data)) {
        if (event && this.page === 1) {
          this.notificationData = res.data.data;
        } else {
          this.notificationData = [...this.notificationData, ...res.data.data];
        }
        this.total_notifications = res.data.total;
      } else {
        if (event && this.page === 1) {
          this.notificationData = [];
        }
        this.total_notifications = 0;
      }

      console.log("total_notification :",this.total_notifications);
    }, (err) => {
      this.showSpinner = 2;
      if (event) {
        event.target.complete();
      }
      console.error('Error fetching notifications:', err);
    });
  }



  loadMore(event: any) {
    this.page++;
    this.getNotifications(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    this.getNotifications(event);
  }

  calculateTimeAgo(timestamp: string): string {
    return moment(timestamp).fromNow();
  }


  async deleteAlert(index: any, notificationId: any) {
    const alert = await this.alertController.create({
      header: 'Delete!',
      subHeader: "Are you sure?",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.deleteNotification(index, notificationId)
          },
        },
      ],
    });
    await alert.present();
  }

  deleteNotification(index: any, notificationId: any) {
    const payload = {
      notification_id: notificationId,
      token: this.logUser.token
    }
    this.commonService.showLoader()
    this.apiService.send('delete-Therapist-notification', payload).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        this.notificationData.splice(index, 1);
        this.commonService.presentToast(res.message, "success");
      },
      error: (err: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    })
  }

  async clearAllAlert() {
    const alert = await this.alertController.create({
      header: 'Clear All!',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.clearAll();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          },
        },
      ],
    });
    await alert.present();
  }

  clearAll() {
    const payLoad = {
      token: this.logUser.token
    }
    this.commonService.showLoader();
    this.apiService.send('delete-Therapist-notification', payLoad).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentToast(res.message, 'success');
        this.notificationData = [];
      },
      error: (err: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    })
  }

  handleNotificationClick(notification: any) {
    console.log('notification', notification);

    if (notification.type === 'therapistAssigned' || notification.type === 'newRequestOpportunity' || notification.type === 'cancellation' || notification.type === 'report' ||
      notification.type == 'reminder' || notification.type == 'newRequestOpportunity' || notification.type == 'requestPending'
      || notification.type == 'sessionReminder' || notification.type == 'sessionStart' || notification.type == 'sessionStart'
      || notification.type == "requestPendingRemainder" || notification.type == "bonus_tip") {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          booking_id: notification.booking_id,
          status: notification.status
        }
      };
      this.router.navigate(['/selected-session'], navigationExtras);

    } else if (notification.type === 'newClientReview') {

      this.router.navigate(['/profile']);

    }
     else if (notification.type === 'licensureStatus') {

      this.router.navigate(['/profile']);

    } else if (notification.type === 'chat') {

      const navigationExtras: NavigationExtras = {
        queryParams: {
          type: notification.type
        }
      };
      this.router.navigate(['/messages'], navigationExtras);

    } else {
      console.log('Notification type not handled:', notification.type);
    }

    // Update notification count regardless of the type
    this.updateNotificationCount(notification.id);
  }



  updateNotificationCount(notificationId: any) {
    console.log('notificationId', notificationId)
    const payload = {
      token: this.logUser.token,
      notification_id: notificationId
    };
    console.log('payLoad', payload);
    this.apiService.send('mark-as-read-notification', payload).subscribe({
      next: (res: any) => {
        this.getTotalNotification();

        this.notificationData = this.notificationData.map((notification: any) => {
          if (notification.id === notificationId) {
            return { ...notification, status: true };
          }
          return notification;
        });
      },
      error: (err: any) => {
        console.error('Error updating notification status:', err);
      }
    });
  }

  getTotalNotification() {
    this.apiService.fetchData(`count_unread_notification`, this.logUser.token).subscribe({
      next: (res: any) => {
        console.log('resNotification', res);
        this.totalNotification_count = res.un_read;
        console.log('totalNotification', this.totalNotification_count);
        this.commonService.notification_count.next(this.totalNotification_count);
      },
      error: (err: any) => {
        console.log('err', err);
      }
    })
  }
}
