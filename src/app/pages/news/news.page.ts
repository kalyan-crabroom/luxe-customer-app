import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  page: any = 1;
  ready: number = 0;
  news: any = [];
  logUser: any;
  fetching: any;
  total: any = 0;
  refreshing: boolean = false;

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.page = 1;
        this.news = [];
        this.getNews();
      }
    });
  }

  getNews(isInitialLoad: boolean = false, event: any = null) {
    if (event) {
      this.ready = 3;
    } else {
      this.ready = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    this.fetching = this.apiService.fetchData(`news?page=${this.page}`, this.logUser.token).subscribe({
      next: (resp: any) => {
        console.log('res', resp);
        this.ready = 2;
        if (event) {
          event.target.complete();
          if (isInitialLoad) {
            this.news = resp.data.news;
            console.log('news1', this.news);
          } else {
            this.news = [...this.news, ...resp.data.news];
            console.log('news2', this.news);
          }
          this.total = resp.data.pagination.total;
          console.log('total1', this.total);
        } else {
          this.news = resp.data.news;
          console.log('news3', this.news);
          this.total = resp.data.pagination.total;
          console.log('total2', this.total);
        }
      },
      error: (err: any) => {
        this.ready = 2;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  loadMore(event: any) {
    this.page++;
    this.getNews(false, event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.ready = 3;
    // this.news = [];
    this.getNews(true, event);
  }
}
