import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-request-history',
  templateUrl: './request-history.page.html',
  styleUrls: ['./request-history.page.scss'],
})
export class RequestHistoryPage implements OnInit {

  details: any
  currentTime: any;
  logUser: any;
  dataList: any[] = [];
  requestType: any;
  bookingData: any = [];
  ready: boolean = false;
  allBookingList: any = [];
  page: number = 1;
  total_history: number = 0;
  showSpinner: number = 0;
  fetching: any
  searchQuery: any = '';
  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getBookingHistory();
      }
    });
  }

  getBookingHistory(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }

    this.fetching = this.apiService.fetchData(`getBookingHistory?page=${this.page}&searchQuery=${this.searchQuery}`, this.logUser.token).subscribe({
      next: (res: any) => {
        this.showSpinner = 2;
        console.log("booking history", res)
        if (event) {
          event.target.complete()
        }
        if (res && Array.isArray(res.data.data)) {
          if (event && this.page === 1) {
            this.bookingData = res.data.data;
            console.log('show1', this.bookingData);
          } else {
            this.bookingData = [...this.bookingData, ...res.data.data];
          }
          this.total_history = res.data.total;
          console.log('total', this.total_history);

        } else {
          this.bookingData = [];
          console.log('No bookings found');
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
    this.getBookingHistory(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    this.getBookingHistory(event);
  }

  handleInput(event: any) {
    this.searchQuery = event.target.value;
    this.page = 1;
    this.bookingData = [];
    this.getBookingHistory();
  }

  clear() {
    this.searchQuery = '';
    this.getBookingHistory();
  }

  goToBooking(item: any) {
    console.log('item', item);
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: item.id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

}
