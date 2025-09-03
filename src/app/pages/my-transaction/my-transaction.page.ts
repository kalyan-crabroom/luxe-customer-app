import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-my-transaction',
  templateUrl: './my-transaction.page.html',
  styleUrls: ['./my-transaction.page.scss'],
})
export class MyTransactionPage implements OnInit {
  logUser: any
  ready: boolean = false
  transaction: any = []
  page: number = 1;
  total_data: number = 0;
  showSpinner: number = 0;
  fetching: any
  perPage: number = 10;
  constructor(
    private apiService: ApiService,
    private storageService: StorageService,

  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getTransaction()
      }
    });
  }

  getTransaction(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    this.fetching = this.apiService.fetchData(`customer-transaction-history?page=${this.page}&per_page=${this.perPage}`, this.logUser.token).subscribe({
      next: (res: any) => {
        this.showSpinner = 2;
        console.log("resTransaction", res)
        if (event) {
          event.target.complete()
        }
        if (res && Array.isArray(res.data.data)) {
          if (event && this.page === 1) {
            this.transaction = res.data.data;
            console.log('transaction1', this.transaction);

          } else {
            this.transaction = [...this.transaction, ...res.data.data];
            console.log('transaction2', this.transaction);
          }
          this.total_data = res.data.total;
          console.log('transactionTotal', this.total_data);

        } else {
          this.transaction = [];
        }
      }, error: (err: any) => {
        this.showSpinner = 2;
        if (event) {
          event.target.complete();
        }
      }
    })
  }

  loadMore(event: any) {
    this.page++;
    this.getTransaction(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    this.getTransaction(event);
  }
}
