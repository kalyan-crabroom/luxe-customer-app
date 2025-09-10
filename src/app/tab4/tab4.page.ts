import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarComponent, CalendarMode } from 'ionic2-calendar';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { StorageService } from '../services/storage.service';
// import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  
  eventSource = [];
  viewTitle!: string;
  logUser: any;
  bookingList: any = [];
  selectedDate: any = '';
  ready: boolean = false;


  overTimeBooking: any[] = [];
  notOverTimeBooking: any[] = [];

  calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date()
  }

  @ViewChild(CalendarComponent) myCal!: CalendarComponent;

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    private router: Router
  ) { 
  }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getBookings();
      }
    });
  }

  next(){
    this.myCal.slideNext();
  }

  back(){
    this.myCal.slidePrev();
  }

  onViewTitleChanged(title: any){
    this.viewTitle = title;
  }

  onCurrentDateChanged(event: any) {
    this.selectedDate = this.datePipe.transform(event, 'yyyy-MM-dd');
    console.log('Selected date:', this.selectedDate);
    this.getBookings();
  }

  reloadSource(startTime: any, endTime: any){
console.log("start time", startTime);
console.log("end time", endTime);
  }

  async getBookings(){
    this.overTimeBooking = [];
    this.notOverTimeBooking = [];
    let payload = {
      therapist_id: 348,
      booking_date: this.selectedDate,
      token: "Bearer 864|ro11uhq7Q7JnrDaXd7Id3NhP7EQwmRMbSLaYitAU0c6b0430"
    }
    this.ready = false;
   await this.apiService.send("getBookingTherapistById", payload).subscribe({
      next: (res: any) => {
        this.ready = true;
        console.log("booking list", res);
        this.bookingList = res.data;
        this.checkTimeStatusForItems(res.data);
      }, error: (err: any)=> {
        this.ready = true;
      }
    })
  }

  checkTimeStatusForItems(bookingList: any) {
    const today = new Date(); // Today's date
    const currentTime = new Date(); // Current time as a Date object

    bookingList.forEach((item: any) => {
      const storedDateParts = item.booking_date.split('-');
      const storedTimeParts = item.booking_start_time.split(':');
      let hours = parseInt(storedTimeParts[0]);
      let minutes = 0;
      let meridiem = 'AM';

      if (storedTimeParts[1]) {
        const meridiemParts = storedTimeParts[1].split(' ');
        minutes = parseInt(meridiemParts[0]);
        meridiem = meridiemParts[1];
      }

      // Adjust hours for 24-hour format
      if (meridiem === 'PM' && hours < 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0; // Midnight case
      }

      // Create Date object for stored date and time
      const storedDateTime = new Date(
        parseInt(storedDateParts[0]),
        parseInt(storedDateParts[1]) - 1, // Month is zero-indexed in JavaScript
        parseInt(storedDateParts[2]),
        hours,
        minutes,
        0 // Assuming seconds are always 0
      );

      // Compare stored date and time with current date and time
      item.isTimeOver = storedDateTime < currentTime;
      
      // Categorize items based on isTimeOver flag
      if (item.isTimeOver) {
        this.overTimeBooking.push(item);
      } else {
        this.notOverTimeBooking.push(item);
      }
    });
  }

  viewAll(status: any){
    let data = {
      date: this.selectedDate,
      status: status
    }
    this.router.navigate(['/tabs/tab4/request-history/'+JSON.stringify(data)]);
  }

}
