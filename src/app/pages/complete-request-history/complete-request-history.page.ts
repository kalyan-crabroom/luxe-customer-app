import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-complete-request-history',
  templateUrl: './complete-request-history.page.html',
  styleUrls: ['./complete-request-history.page.scss'],
})
export class CompleteRequestHistoryPage implements OnInit {
  logUser: any;
  ready: boolean = false;
  get_historyData: any = []
  page: number = 1;
  showSpinner: number = 0;
  fetching: any;
  total_Data: number = 0
  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      this.logUser = user;
      this.getRequestHistory()
    });
  }
  // if (event) {
  //   this.showSpinner = 3;
  // } else {
  //   this.showSpinner = 1;
  // }
  // if (this.fetching) {
  //   this.fetching.unsubscribe();
  // }

  // this.apiService.fetchData(`get-userbooking?page=${this.page}`, this.logUser.token).subscribe({
  //   next: (res: any) => {
  //     console.log('resDetail', res);
  //     this.showSpinner = 2;
  //     if (event) {
  //       event.target.complete();
  //     }
  //     if (res && Array.isArray(res.bookings)) {
  //       if (event && this.page === 1) {
  //         this.bookingData = res.bookings;
  //         console.log('show1', this.bookingData);
  //       } else {
  //         this.bookingData = [...this.bookingData, ...res.bookings];
  //         console.log('show2', this.bookingData);
  //       }
  //       this.total_bookingData = res.pagination.total;
  //       console.log('total;', this.bookingData);
  //     } else {
  //       this.bookingData = [];
  //       console.log('No bookings found');
  //     }
  getRequestHistory(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }

    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    this.fetching = this.apiService.fetchData(`get-complete-bookings?page=${this.page}`, this.logUser.token).subscribe((res: any) => {
      console.log('res122', res);
      this.showSpinner = 2;
      if (event) {
        event.target.complete();
      }
      if (res && Array.isArray(res.data.allBookings.data)) {
        if (event && this.page === 1) {
          this.get_historyData = res.data.allBookings.data;
          console.log('show1', this.get_historyData);
        } else {
          this.get_historyData = [...this.get_historyData, ...res.data.allBookings.data];
          console.log('show2', this.get_historyData);
        }
        this.total_Data = res.data.allBookings.total;
        console.log('total;', this.total_Data);
      } else {
        this.get_historyData = [];
        console.log('no booking found');

      }
      // this.get_historyData = res.data.allBookings.data;
      // console.log('get',this.get_historyData);

    }, (err: any) => {
      this.showSpinner = 2;
      if (event) {
        event.target.complete();
      }
    })
  }
  goToNext(id: any) {
    console.log('idss', id);
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

  loadMore(event: any) {
    this.page++;
    this.getRequestHistory(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    console.log('sp3', this.showSpinner);
    this.getRequestHistory(event);
  }
}
