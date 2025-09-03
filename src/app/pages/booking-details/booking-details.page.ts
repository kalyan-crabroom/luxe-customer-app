import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.page.html',
  styleUrls: ['./booking-details.page.scss'],
})
export class BookingDetailsPage implements OnInit {
  logUser: any = []
  bookingData: any = []
  ready: boolean = false
  page: number = 1;
  showSpinner: number = 0;
  fetching: any;
  total_bookingData: number = 0
  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getBookingAllDeatils()
      }
    });
  }

  getBookingAllDeatils(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    this.apiService.fetchData(`get-userbooking?page=${this.page}`, this.logUser.token).subscribe({
      next: (res: any) => {
        this.showSpinner = 2;
        if (event) {
          event.target.complete();
        }
        if (res && Array.isArray(res.bookings)) {
          if (event && this.page === 1) {
            this.bookingData = res.bookings;
          } else {
            this.bookingData = [...this.bookingData, ...res.bookings];
          }
          this.total_bookingData = res.pagination.total;
        } else {
          this.bookingData = [];
        }
      },
      error: (err: any) => {
        this.showSpinner = 2;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  loadMore(event: any) {
    this.page++;
    this.getBookingAllDeatils(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    this.getBookingAllDeatils(event);
  }

  goToNext(id: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }
}
