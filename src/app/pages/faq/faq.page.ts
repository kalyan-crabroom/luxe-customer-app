import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {
  logUser: any;
  show_faqs: any = [];
  showSpinner: number = 0;
  total_faqs: number = 0;
  fetching: any;
  page: number = 1;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getFaqs();
      }
    });
  }

  getFaqs(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }

    this.fetching = this.apiService.fetchData(`faqs?page=${this.page}`, this.logUser.token).subscribe({
      next: (resp: any) => {
        console.log('res', resp);
        this.showSpinner = 2;
        if (event) {
          event.target.complete();
        }
        if (event && this.page === 1) {
          this.show_faqs = resp.data.faqs;
          console.log('show1', this.show_faqs);
        } else {
          this.show_faqs = [...this.show_faqs, ...resp.data.faqs];
          console.log('show2', this.show_faqs);
        }
        this.total_faqs = resp.data.pagination.total;
        console.log('total;', this.total_faqs);

      },
      error: (err: any) => {
        this.showSpinner = 2;
        if (event) {
          event.target.complete();
        }
        console.log('err', err);
      }
    });
  }

  loadMore(event: any) {
    this.page++;
    this.getFaqs(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    console.log('sp3', this.showSpinner);

    this.getFaqs(event);
  }
}
