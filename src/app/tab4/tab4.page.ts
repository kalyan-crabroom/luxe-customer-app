import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CalendarComponent, CalendarMode } from 'ionic2-calendar';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { StorageService } from '../services/storage.service';
import { Capacitor } from '@capacitor/core';
import * as moment from 'moment';
declare var jQuery: any;

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  eventSource = [];
  viewTitle!: string;
  dates: { date: number, day: string }[] = [];
  logUser: any;
  bookingList: any = [];
  selectedDate: any = '';
  clickedDate: any = '';
  ready: boolean = false;
  ready1: boolean = false;
  currentDate: any = new Date();;
  dateSelected: number | null = null;
  clickedIndex: number | null = null;
  overTimeBooking: any[] = [];
  notOverTimeBooking: any[] = [];
  bookingHistory: any = []
  calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date()
  }
  highlightedDates: any = [];

  @ViewChild(CalendarComponent) myCal!: CalendarComponent;
  selectedSegment: string = 'upcoming';
  helptext: any;
  is_modal: boolean = false;
  minDate: any = new Date().toISOString();

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private commonService: CommonService,
    private modalController: ModalController,
    private router: Router,
    public cdref: ChangeDetectorRef
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log("event :", event.url);
        if (event.url == "/tabs/mysessions") {
          this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
            if (user != null) {
              this.logUser = user;
              this.selectedDate = '';
              this.dateSelected = null;
              this.clickedIndex = null;
              this.getBookings();
              this.getBookingHistory()
            }
          });

        }
      }
    });

  }

  ngOnInit() {
    this.populateDates();
  }

  openCalendar(is_modal: boolean) {

    this.is_modal = is_modal;
    setTimeout(() => {
      var data = jQuery(jQuery("ion-datetime")[0].shadowRoot.childNodes)[2];
      console.log("data:", data);
      var dayOfWeekElements = jQuery(data).find('.day-of-week');
      if (dayOfWeekElements.length > 0) {
        dayOfWeekElements.each(function (e: any) {
          var element = jQuery(dayOfWeekElements[e]);
          var text = element.text();
          element.text(text.substring(0, 1));
        });
      } else {
        var data = jQuery(jQuery("ion-datetime")[0].shadowRoot.childNodes)[1];
        console.log("data:", data);

        var dayOfWeekElements = jQuery(data).find('.day-of-week');
        if (dayOfWeekElements.length > 0) {
          dayOfWeekElements.each(function (e: any) {
            var element = jQuery(dayOfWeekElements[e]);
            var text = element.text();
            element.text(text.substring(0, 1));
          });
        }
      }
    }, 200);

    let formatedDate = moment(this.selectedDate).format('YYYY-MM-DD');

    this.highlightedDates = [{
      date: formatedDate,
      textColor: 'rgb(68, 10, 184)',
      backgroundColor: 'rgb(211, 200, 229)',
    }]
    this.cdref.detectChanges();
  }

  ionViewWillEnter() {
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'my_sessions');
    }

    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getBookings();
        this.getBookingHistory()
      }
    });

    this.commonService.refresh_mysession.subscribe((res: any) => {
      if (res) {
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.logUser = user;
            this.getBookings();
            this.getBookingHistory()
          }
        });
      }
    });

  }

  getDayName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  populateDates() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    for (let i = 0; i <= 13; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      this.dates.push({
        date: date.getDate(),
        day: days[date.getDay()]
      });
    }
  }

  selectDate(selectedDate: { date: number, day: string }, index: number) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.clickedDate = new Date(year, month, selectedDate.date);
    this.selectedDate = this.clickedDate;
    this.dateSelected = selectedDate.date;
    this.clickedIndex = index;
    this.currentDate = this.clickedDate;
    this.getBookings();
  }

  getBookings() {
    const payload: any = {
      token: this.logUser.token,
      status: this.selectedSegment
    };

    if (this.selectedDate) {
      payload.booking_date = this.formatDate(this.selectedDate);
    }

    this.ready = false;
    this.apiService.send('getBookingByDate', payload).subscribe((res: any) => {
      this.ready = true;
      this.bookingList = res;
      console.log("bookingList :", this.bookingList);
      // if (this.selectedDate) {
      //   this.bookingList = this.bookingList.filter((booking: any) => {
      //     return this.formatDate(new Date(booking.booking_date)) === this.formatDate(this.selectedDate);
      //   });
      // }
      console.log("bookingList :", this.bookingList);
    }, (err) => {
      this.ready = true;
      this.bookingList = [];
    });
  }

  formatDate(date: Date): string {
    if (!(date instanceof Date)) {
      throw new Error('Invalid date');
    }
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getBookingHistory() {
    const payLoad = {
      token: this.logUser.token,
      status: 'history'
    }
    this.ready1 = false;
    this.apiService.send('getBookingByDate', payLoad).subscribe({
      next: (res: any) => {
        console.log('resHistory>>', res);
        this.ready1 = true;
        this.bookingHistory = res || [];
        console.log('BbokingDataHistory>>>', this.bookingHistory);
      },
      error: (err: any) => {
        this.ready1 = true;
      }
    })
  }

  goToBooking(item: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: item.id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

  async onDateSelected(event: any) {
    const newSelectedDate = new Date(event.detail.value);
    if (newSelectedDate.getMonth() !== this.currentDate.getMonth()) {
      this.selectedDate = newSelectedDate;
      const selectedIndex = this.dates.findIndex(date => date.date === this.selectedDate.getDate());
    } else {
      this.currentDate = newSelectedDate;
      this.selectedDate = newSelectedDate;
      const selectedIndex = this.dates.findIndex(date => date.date === this.selectedDate.getDate());
      if (selectedIndex !== -1) {
        this.clickedIndex = selectedIndex;
      }
    }
    this.is_modal = false;
    this.getBookings();
  }

  async confirmDate() {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss();
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    this.selectedDate = null;
    this.clickedIndex = null;
    this.getBookings();
  }
}
