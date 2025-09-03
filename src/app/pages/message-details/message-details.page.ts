import { Location } from '@angular/common';
import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { ChatService } from 'src/app/services/chat.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.page.html',
  styleUrls: ['./message-details.page.scss'],
})
export class MessageDetailsPage implements OnInit {

  @ViewChild(IonContent) content!: IonContent;

  fromId: any;
  message: any = "";
  toId: any;
  messages: any = [];
  ex: number = 0;
  logUser: any;
  showEmojiPicker: boolean = false;
  user_details: any;
  chatData: any = []
  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private afs: AngularFirestore,
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) { }

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      console.log('params', params);
      if (params && params.chat_data) {
        this.chatData = JSON.parse(params.chat_data)
        const userId = this.chatData.userId
        this.toId = userId;
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.logUser = user;
            this.fromId = user.id;
            this.getMessages();
          }
        });
      }
    })
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  selectEmoji(event: any) {
    this.message += event.emoji.native;
    setTimeout(() => {
      const chatInput = document.getElementById('chat_text') as HTMLInputElement;
      if (chatInput) {
        chatInput.focus();
        chatInput.selectionStart = chatInput.selectionEnd = chatInput.value.length;
      }
    }, 0);
  }
  ngOnInit() {
  }

  async getMessages() {
    await this.chatService.getMessages().subscribe((res: any) => {
      for (var i = 0; i < res.length; i++) {
        if ((res[i].from == this.logUser?.id && res[i].to == this.toId) || (res[i].from == this.toId && res[i].to == this.logUser?.id)) {
          var msgid = this.messages.filter((c: { id: any; }) => c.id == res[i].id);
          if (!msgid.length) {
            this.messages.push(res[i]);
            this.ex = 0;
          }
          if (res[i].msgSenderId && this.logUser.id && res[i].msgSenderId != this.logUser.id) {
            this.afs.doc(`messages/${res[i].id}`).update({ msgSenderId: null });
          }
        }
      }
      if (this.ex == 0) {
        setTimeout(() => {
          this.content.scrollToBottom(300);
        }, 10);
      }
    });
  }

  sendMessage() {
    var msg = this.message;
    this.message = "";
    if (msg) {
      this.chatService.sendMessage(this.fromId, msg, this.toId);
      this.showEmojiPicker = false;
      this.notification_function(this.toId, msg);
    }
  }

  getUserById(userId: any) {
    let payload = {
      user_id: userId
    }
    this.apiService.sendData("userInfoById", payload).subscribe({
      next: async (res: any) => {
        this.user_details = res.data;
        console.log('user_details', this.user_details)
      }, error: (err: any) => {

      }
    })
  }

  notification_function(to_user_id: any, message: any) {
    let body = {
      to_user_id: to_user_id,
      message: message,
      token: this.logUser.token,
      msg_type: 'chat'
    }
    this.apiService.send('send-chat-notification', body).subscribe((res: any) => {
      console.log('body', body);
    }, (err) => {
      console.log("notification err :", err);
    });
  }

  ngOnDestroy() {
    this.logUser = null;
  }

  goToCustomer(id: any) {
    const parameter: NavigationExtras = {
      queryParams: {
        customer_id: id
      }
    }
    this.router.navigate(['customer-profile'], parameter)

  }

  // calculateTimeAgo(timestamp: string): string {
  //   return moment(timestamp).fromNow();
  // }

  calculateTimeAgo(timestamp: string): string {
    const isToday = moment(timestamp).isSame(moment(), 'day'); 
    if (isToday) {
      return moment(timestamp).format('hh:mm A'); 
    } else {
      return moment(timestamp).fromNow(); 
    }
  }

  goBack() {
    this.location.back();
  }
}
