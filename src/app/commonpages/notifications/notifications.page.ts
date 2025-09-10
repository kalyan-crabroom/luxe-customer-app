import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
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
  logUser: any = []
  page: number = 1;
  showSpinner: number = 0;
  notificationData: any = []
  fetching: any
  total_notification: number = 0;
  totalNotification_count: any
  constructor(
    private storageService: StorageService,
    private commonService: CommonService,
    private apiService: ApiService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getAllNotifications()
      }
    });
  }

  async ionViewWillEnter() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url == "/tabs/notifications") {
          this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
            if (user != null) {
              this.logUser = user;
              this.getAllNotifications()
            }
          });
        }
      }
    });
  }


  getAllNotifications(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    this.fetching = this.apiService.fetchData(`getNotification?page=${this.page}`, this.logUser.token).subscribe((res: any) => {
      this.showSpinner = 2;
      if (event) {
        event.target.complete();
      }
      if (event && this.page === 1) {
        this.notificationData = res.data;
        console.log('show1', this.notificationData);
      } else {
        this.notificationData = [...this.notificationData, ...res.data];
        console.log('show2', this.notificationData);
      }
      this.total_notification = res.total;
    }, (err) => {
      this.showSpinner = 2;
      if (event) {
        event.target.complete();
      }
      this.commonService.presentAlert(err.error.message);
    });
  }

  calculateTimeAgo(timestamp: string): string {
    return moment(timestamp).fromNow();
  }

  async deleteAlert(index: any, notificationId: any) {
    console.log('notificationId', notificationId);
    const alert = await this.alertController.create({
      header: 'Delete!',
      subHeader: "Are you sure?",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('click to canceal');

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
    console.log('payLoad', payload);
    this.commonService.showLoader()
    this.apiService.send('deleteNotification', payload).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.commonService.dismissLoading();
        this.notificationData.splice(index, 1);
        this.commonService.presentToast(res.message, "success");

      },
      error: (err: any) => {
        console.log('err', err);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    })
  }

  async clearAllAlert() {
    const alert = await this.alertController.create({
      header: 'Delete!',
      message: 'Are you sure want to clear all the notification?',
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
            console.log('canceal');

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
    console.log('payload', payLoad);
    this.commonService.showLoader();
    this.apiService.send('deleteNotification', payLoad).subscribe({
      next: (res: any) => {
        console.log('res:ClearAll', res);
        this.commonService.dismissLoading();
        this.commonService.presentToast(res.message, 'success');
        this.notificationData = [];
      },
      error: (err: any) => {
        console.log('err', err);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    })
  }

  loadMore(event: any) {
    this.page++;
    this.getAllNotifications(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    console.log('sp3', this.showSpinner);
    this.getAllNotifications(event);
  }

  handleNotificationClick(notification: any) {
    console.log('notification', notification);

    if (notification.type === 'requestAccepted' || notification.type === 'cancellation' || notification.type === 'report' ||
      notification.tyoe == 'reminder' || notification.type == 'newRequestOpportunity' || notification.type == 'requestPending' || notification.type == 'sessionReminder'
      || notification.type == 'sessionStart' || notification.type == 'sessionStart' || notification.type == "requestPendingRemainder" || notification.type == "cancelledRequest") {

      const navigationExtras: NavigationExtras = {
        queryParams: {
          booking_id: notification.booking_id,
          status: notification.status
        }
      };
      console.log('navigationExtras', navigationExtras);
      this.router.navigate(['/selected-session'], navigationExtras);
      this.updateNotificationCount(notification.id);
    } else if (notification.type === 'completedRequest') {
      this.goToSession(notification.booking_info);
    } else if (notification.type === 'chat') {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          type: notification.type
        }
      };
      this.router.navigate(['/messages'], navigationExtras);
      this.updateNotificationCount(notification.id);
    }
  }

  goToSession(data: any) {
    this.router.navigate(['/session-completed'], { state: data });
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
        this.getTotalNotification()
        console.log('Notification status updated:', res);
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
