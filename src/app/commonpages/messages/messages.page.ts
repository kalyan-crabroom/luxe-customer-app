import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { StorageService } from 'src/app/services/storage.service';
import { LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {

  logUser: any;
  chatUserList: any = [];
  isEmpty: boolean = false;
  is_ready: boolean = false
  helptext: any;

  constructor(
    private chatService: ChatService,
    private storageService: StorageService,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'messages');
    }
  }

  ngOnInit() {

  }


  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        console.log(' this.logUser', this.logUser);
        this.getChatUserList(this.logUser);
      }
    });
  }

  async getChatUserList(loginUser: any) {
    // await this.commonService.showLoader();
    this.is_ready = true;
    this.chatService.getMessages().subscribe((res: any) => {
      // this.commonService.dismissLoading();
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
      var data = { "user_list": user_list, "token": loginUser.token };
      console.log('data', data);
      console.log("user_list.length :", user_list.length);
      if (user_list.length) {
        this.apiService.send("getUserInfoByIds", data).subscribe((res: any) => {
          this.commonService.dismissLoading();
          this.is_ready = false;
          this.isEmpty = false;
          this.chatUserList = res;
          if (res.length == 0) {
            this.isEmpty = true;
          }

          this.chatUserList.sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          });
        }, (error: any) => {
          this.commonService.dismissLoading();
          //reject(error);
        });
      } else {
        this.is_ready = false;
        this.isEmpty = true;
        this.chatUserList = [];
        this.commonService.dismissLoading();
        //resolve(false);
      }
    }, (err) => {
      this.isEmpty = true;
      this.is_ready = false;
      this.chatUserList = [];
      this.commonService.dismissLoading();
    });
  }

  // chat(id: any) {
  //   this.router.navigate(['/message-details/' + id]);
  // }

  chat(item: any) {
    const stringifiedItem = JSON.stringify(item);
    let parameter: NavigationExtras = {
      queryParams: {
        chat_data: stringifiedItem
      }
    };
    this.router.navigate(['/message-details'], parameter);

    console.log('parameterChat', parameter);
  }


  getTimeDifference(date: Date): string {
    return moment(date).fromNow();
  }

}
