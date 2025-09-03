import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-gift-cards',
  templateUrl: './gift-cards.page.html',
  styleUrls: ['./gift-cards.page.scss'],
})
export class GiftCardsPage implements OnInit {

  logUser: any;
  is_ready: boolean = false;
  page:any = 1;
  per_page:any = 10
  gift_cards:any = [];
  constructor(
    public cdref: ChangeDetectorRef,
    public apiService: ApiService,
    public commonService: CommonService,
    public storageService: StorageService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getGiftCard();
      }
    });
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.getGiftCard();
    event.target.complete();
  }

  getGiftCard() {
    this.is_ready = true;
    // this.apiService.fetchData(`get-gift-card?per_page=${this.per_page}&page=${this.page}`,this.logUser.token).subscribe((res: any) => {
    this.apiService.fetchData(`get-gift-card`,this.logUser.token).subscribe((res: any) => {
      this.is_ready = false;
      this.gift_cards = res.data || [];
    }, (err) => {
      console.log("err :", err);
      this.is_ready = false;
      this.gift_cards = [];
    });
  }

  loadMore(event: any){
    this.is_ready = true;
    this.page = this.page + 1
    this.apiService.get(`get-gift-card?per_page=${this.per_page}&page=${this.page}`).subscribe((res: any) => {
      this.is_ready = false;
      this.gift_cards = [...this.gift_cards, ...(res.data.data || [])]; 
      event.target.complete();
      if (!res.next_page_url) { 
        event.target.disabled = true; 
        return;
      }
    }, (err) => {
      console.log("err :", err);
      this.is_ready = false;
      this.gift_cards = [];
    });
  }

}
