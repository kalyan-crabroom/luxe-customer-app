import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { LoadingController, NavController } from '@ionic/angular';
import { ChatService } from '../services/chat.service';
import { CommonService } from '../services/common.service';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { ApiService } from '../services/api.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  isModalOpen: boolean = false;
  logUser: any;
  unreadchat: number = 0;
  totalNotification_count: any = 0;
  constructor(
    private cdref: ChangeDetectorRef,
    private storageService: StorageService,
    private navController: NavController,
    private apiService: ApiService,
    private chatService: ChatService,
    private commonService: CommonService,
    private router: Router,

  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        console.log("login user", user);
        this.getChatUserList(this.logUser);
        // this.commonService.notification_count.subscribe((data: any) => {
        //   console.log('data1',data);
        //   // if (data) {
        //     this.apiService.fetchData(`count_unread_notification`,this.logUser.token).subscribe({
        //       next:(res:any)=>{
        //         console.log('resNotification',res);
        //         this.totalNotification_count = res.un_read;
        //         console.log('totalNotification',this.totalNotification_count);
        //       },
        //       error:(err:any)=>{
        //         console.log('err',err);    
        //       }
        //     })

        //   // }
        // });
      }
    });
  }
  ionViewWillEnter() {
    this.commonService.notification_count.subscribe((data: any) => {
      console.log('data1', data);
      // if (data) {
      this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
        if (user != null) {
          this.logUser = user;
          this.getNotificationCount()
        }
      });

      // }
    });
  }
  
  getNotificationCount() {
    this.apiService.fetchData(`count_unread_notification`, this.logUser.token).subscribe((res: any) => {
      this.totalNotification_count = res.un_read;
    }, (err: any) => {
      console.log('err', err);
    })
  }

  logOutModal(isOpen: boolean) {
    this.isModalOpen = isOpen;
    this.cdref.detectChanges();
  }

  logOut() {
    this.isModalOpen = false;
    this.cdref.detectChanges();
    this.storageService.removeFromStorage('deeplyCalm:user');
    this.storageService.removeFromStorage('bookingData');
    this.navController.navigateRoot(['/login']);
    // this.commonService.presentToast('Log Out Successfully !!', 'success');
    if (Capacitor.getPlatform() != 'web') {
      this.updateDeviceToken();
    }
  }

  async getChatUserList(loginUser: any) {
    this.chatService.getMessages().subscribe((res: any) => {
      var user_list: any[] = [];
      var chatList = res.filter((x: { from: any; to: any; }) => x.from == loginUser.id || x.to == loginUser.id);
      for (var i = 0; i < chatList.length; i++) {
        var indexOf = user_list.findIndex(y => y.userId == chatList[i].from || y.userId == chatList[i].to);
        if (indexOf != -1) {
          user_list[indexOf].msg = chatList[i].msg;
          user_list[indexOf].date = chatList[i].createdAt;
          user_list[indexOf].msgSenderId = chatList[i].msgSenderId;
          user_list[indexOf].unread += chatList[i].msgSenderId ? 1 : 0;
        } else {
          if (chatList[i].from == loginUser.id) {
            user_list.push({
              "userId": Number(chatList[i].to),
              "msgSenderId": chatList[i].msgSenderId,
              "msg": chatList[i].msg,
              "date": chatList[i].createdAt,
              "unread": chatList[i].msgSenderId ? 1 : 0
            });
          } else {
            user_list.push({
              "userId": Number(chatList[i].from),
              "msgSenderId": chatList[i].msgSenderId,
              "msg": chatList[i].msg,
              "date": chatList[i].createdAt,
              "unread": chatList[i].msgSenderId ? 1 : 0
            });
          }
        }
      }
      this.unreadchat = user_list.filter((x: { msgSenderId: any; }) => x.msgSenderId && x.msgSenderId != loginUser.id).length;
      //resolve(user_list);
    });
  }

  async updateDeviceToken() {
    let payload = {
      token: this.logUser.token,
      uuid: (await Device.getId()).identifier,
    }
    this.apiService.send('logout', payload).subscribe((res: any) => {
      console.log("res :", res);
    }, (err) => {
      console.log("err:", err);
    });
  }

  goToSubscriptionPage() {
    let parameter: NavigationExtras = {
      queryParams: {
        page: 'home'
      }
    };
    this.router.navigate(['/select-membership'], parameter);
  }
}
