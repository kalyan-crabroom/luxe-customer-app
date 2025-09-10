import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  bookingList: any[] = [];
  ready: boolean = false;
  allBookingList: any = [];

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.activeRoute.paramMap.subscribe((data: any) => {
      this.details = JSON.parse(data.params.details);
      if (this.details.status == "upcoming") {
        this.requestType = "Upcoming Request";
      } else {
        this.requestType = "Request History";
      }
      console.log("data fetching details", this.details);
    }
    );

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getCurrentTime();
      }
    });
  }

  getCurrentTime() {
    const date = new Date();
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());

    // Construct the time string
    this.currentTime = `${hours}:${minutes}:${seconds}`;
    console.log("current time", this.currentTime);
    this.getBookingHistory();
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : '' + num;
  }

  getBookingHistory() {
    let payload = {
      booking_date: this.details.date,
      booking_start_time: this.currentTime,
      status: this.details.status,
      token: "Bearer 1135|LgVxSyNTlNyuIylVb30mMdofgfOjJ8xXR48rbS8c6f12a463"
    }
    this.ready = false;
    this.apiService.send("getBookingByDate", payload).subscribe({
      next: (res: any) => {
        this.ready = true;
        console.log("booking history", res.bookings)
        this.bookingList = res.bookings;
        this.allBookingList = res.bookings;
      }, error: (err: any) => {
        this.ready = true;
      }
    })
  }

  handelFilter(event: any) {
    this.bookingList = this.allBookingList.filter((x: { username: string | any }) => x.username.toLowerCase().includes(event.target.value.toLowerCase()));
  }

}
