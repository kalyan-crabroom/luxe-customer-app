import { Component } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { StorageService } from '../services/storage.service';
import { ApiService } from '../services/api.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  unreadchat: number = 0;
  logUser: any;
  totalNotification_count: any = 0;
  constructor(
    private chatService: ChatService,
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getChatUserList(this.logUser);
        this.getNotificationCount();
      }
    });

    this.apiService.location_refresh.subscribe((res: any) => {
      if (res) {
        this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
          this.logUser = user;
          this.getNotificationCount();
        });
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
              this.getNotificationCount()
            }
          });
        }
      }
    });
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
    });
  }

  getNotificationCount() {
    this.apiService.fetchData(`count_unread_notification`, this.logUser.token).subscribe((res: any) => {
      this.totalNotification_count = res.un_read;
    }, (err: any) => {
      console.log('err', err);
    })
  }

}
