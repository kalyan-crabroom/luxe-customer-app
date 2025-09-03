import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { StorageService } from '../services/storage.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  logUser: any = []
  unreadchat: number = 0;
  totalNotification_count: any = 0;
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private storageService: StorageService,
    private chatService: ChatService
  ) {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getChatUserList(this.logUser);
      }
    });
  }

  ionViewWillEnter() {
    this.commonService.notification_count.subscribe((data: any) => {
      console.log('data1', data);
      // if (data) {
      this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
        if (user != null) {
          this.logUser = user;
          this.getNotificationCount()
        }
      });

      // }
    });
  }
  getNotificationCount() {
    this.apiService.fetchData(`count_unread_notification`, this.logUser.token).subscribe({
      next: (res: any) => {
        console.log('resNotification', res);
        this.totalNotification_count = res.un_read;
        console.log('totalNotification', this.totalNotification_count);
      },
      error: (err: any) => {
        console.log('err', err);
      }
    })
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
      console.log('unreadchat', this.unreadchat);

      //resolve(user_list);
    });
  }

}
