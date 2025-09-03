import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, IonDatetime, IonModal, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
// import * as moment from 'moment';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-selected-session',
  templateUrl: './selected-session.page.html',
  styleUrls: ['./selected-session.page.scss'],
})

export class SelectedSessionPage implements OnInit {
  loginUser: any = []
  bookingDetails: any = []
  bookingId: any
  ready: boolean = false;
  helptext: any;

  @ViewChild(IonDatetime) popoverStartTime!: IonDatetime;
  @ViewChild(IonDatetime) popoverEndTime!: IonDatetime;

  isStartTimeModal: boolean = false;
  isEndTimeModal: boolean = false;

  startTimeLabel: any = "Start Time";
  endTimeLabel: any = "End Time";
  isButtonEnabled: boolean = false;
  start_time: any;
  end_time: any;
  min: any;
  max: any;
  maxWithDuraion: any;
  error_meessage: any = "No session found.";

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router,
    public cdref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params && params.booking_id) {
        this.bookingId = params.booking_id;
        console.log('this.bookingId', this.bookingId);
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.loginUser = user;
            this.getBookingDetails()
          }
        });
      }
    });
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'session_request');
    }

  }

  getBookingDetails() {
    this.ready = false;
    this.apiService.fetchData(`get_bookingdetails?booking_id=${this.bookingId}`, this.loginUser.token).subscribe((res: any) => {
      this.ready = true;
      this.bookingDetails = res.bookings;
      this.min = `${this.bookingDetails.booking_date}T${this.bookingDetails.start_time}`;
      this.max = `${this.bookingDetails.booking_date}T${this.bookingDetails.end_time}`;
      let duration = this.bookingDetails.therapist_duration;
      let maxTime = moment(this.max);
      let maxTimeWithDuration = maxTime.subtract(duration, 'minutes');
      this.maxWithDuraion = maxTimeWithDuration.format('YYYY-MM-DDTHH:mm:ss');
      this.start_time = this.min
      this.cdref.detectChanges();

    }, (err: any) => {
      this.ready = true;
      this.cdref.detectChanges();
      this.error_meessage = err.error.message;
      console.log('error_meessage', this.error_meessage);
    });
  }

  async acceptRequest() {
    if (!this.start_time || !this.end_time) {
      this.commonService.presentAlert("Please select a time slot before accepting the session.");
      return;
    }

    let s_time = `${this.bookingDetails.booking_date}T${this.bookingDetails.start_time}`;
    let e_time = `${this.bookingDetails.booking_date}T${this.bookingDetails.end_time}`;

    const selectedStartTime = moment(this.start_time);
    const selectedEndTime = moment(this.end_time);

    const bookingStartTime = moment(s_time);
    const bookingEndTime = moment(e_time);

    if (selectedStartTime.isBefore(bookingStartTime) || selectedEndTime.isAfter(bookingEndTime)) {
      this.commonService.presentAlert(`Selected time must be between ${bookingStartTime.format("hh:mm A")} and ${bookingEndTime.format("hh:mm A")}.`);
      return;
    }


    let alert = await this.alertCtrl.create({
      header: "Accept Request",
      message: "Are you sure?",
      buttons: [{
        text: 'Yes',
        role: 'confirm',
        handler: () => {
          this.commonService.showLoader("Please wait...");
          let payload: any = {
            booking_id: this.bookingDetails.id,
            token: this.loginUser.token,
            start_time: moment(this.start_time).format("HH:mm:ss"),
            end_time: moment(this.end_time).format("HH:mm:ss"),
          }
          this.apiService.send('acceptBooking', payload).subscribe((res: any) => {
            this.commonService.dismissLoading();
            this.commonService.presentAlert(res.message, "Congratulations!");
            this.commonService.refresh_home.next(1);
            this.navCtrl.navigateBack(['/tabs/home']);
          }, (err: any) => {
            console.log("error : ", err.error);
            this.commonService.presentAlert(err.error.message);
            this.commonService.dismissLoading();
          });
        }
      }, {
        text: 'No',
        role: 'cancel',
        handler: () => {
          console.log("cancel");
        }
      }]
    });
    await alert.present();
  }

  async ignoreRequest() {
    let alert = await this.alertCtrl.create({
      // header: "Ignore Request",
      message: "Are you sure?",
      buttons: [{
        text: 'Yes',
        role: 'confirm',
        handler: () => {
          this.commonService.showLoader("Please wait...");
          this.apiService.send('ignoreBooking', { booking_id: this.bookingDetails.id, token: this.loginUser.token }).subscribe((res: any) => {
            this.commonService.dismissLoading();
            // this.commonService.presentToast(res.message,'success');
            this.commonService.refresh_home.next(1);
            this.navCtrl.navigateBack(['/tabs/home']);
          }, (err: any) => {
            console.log("error : ", err.error);
            this.commonService.presentAlert(err.error.message);
            this.commonService.dismissLoading();
          });
        }
      }, {
        text: 'No',
        role: 'cancel',
        handler: () => {
          console.log("ignore");
        }
      }]
    });
    await alert.present();
  }

  goToReport(bookingDetails: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        bookingData: JSON.stringify({ ...bookingDetails })
      }
    }
    this.router.navigate(['/report-session'], parameter)
  }

  goToCancel(bookingDetails: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        bookingData: JSON.stringify({ ...bookingDetails })
      }
    }
    this.router.navigate(['/cancel-session'], parameter)
  }

  chat(item: any) {
    console.log('item', item);

    const parameter: NavigationExtras = {
      queryParams: {
        chat_data: JSON.stringify({
          userId: item.user_info?.user_id,
          name: item.user_info?.name,
          profile_image: item.user_info?.user_image
        })
      }
    };
    this.router.navigate(['/message-details'], parameter);
  }


  goCompleteSession(bookingDetails: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        bookingData: JSON.stringify({ ...bookingDetails })
      }
    }
    this.router.navigate(['/session-completed'], parameter)
  }

  goToCustomer(id: any) {
    console.log('id', id);
    const parameter: NavigationExtras = {
      queryParams: {
        customer_id: id
      }
    }
    this.router.navigate(['customer-profile'], parameter)
  }

  onStartTimeChange(event: any) {
    console.log("onStartTimeChange :", event.detail.value);
    this.start_time = event.detail.value;
    this.startTimeLabel = moment(this.start_time).format("hh:mm A");
    console.log("startTimeLabel :", this.startTimeLabel);
    const startMoment = moment(this.start_time);
    const newEndTime = startMoment.add(parseInt(this.bookingDetails.therapist_duration) * parseInt(this.bookingDetails.how_many_people), 'minutes').format();
    this.end_time = newEndTime;
    this.endTimeLabel = moment(this.end_time).format("hh:mm A");
    console.log(this.end_time, "endTimeLabel :", this.endTimeLabel);
    this.cdref.detectChanges();
    this.validateButtonState();
  }

  onEndTimeChange(event: any) {
    console.log("onEndTimeChange :", event.detail.value);
    this.end_time = event.detail.value;
    this.endTimeLabel = moment(this.end_time).format("hh:mm A");
    console.log("end_time :", this.end_time);

    const startMoment = moment(this.start_time);
    const endMoment = moment(this.end_time);

    const durationMinutes = endMoment.diff(startMoment, 'minutes');

    if (durationMinutes < parseInt(this.bookingDetails.therapist_duration) * parseInt(this.bookingDetails.how_many_people)) {
      this.commonService.presentAlert(`End time must be at least ${parseInt(this.bookingDetails.therapist_duration) * parseInt(this.bookingDetails.how_many_people)} minutes after start time.`);
      this.end_time = startMoment.add(parseInt(this.bookingDetails.therapist_duration) * parseInt(this.bookingDetails.how_many_people), 'minutes').format();
      this.endTimeLabel = moment(this.end_time).format("hh:mm A");
    } else if (durationMinutes > parseInt(this.bookingDetails.therapist_duration) * parseInt(this.bookingDetails.how_many_people)) {
      this.commonService.presentAlert(`End time must not exceed ${parseInt(this.bookingDetails.therapist_duration) * parseInt(this.bookingDetails.how_many_people)} minutes from the start time.`);
      this.end_time = startMoment.add(parseInt(this.bookingDetails.therapist_duration) * parseInt(this.bookingDetails.how_many_people), 'minutes').format();
      this.endTimeLabel = moment(this.end_time).format("hh:mm A");
    }
    this.cdref.detectChanges();
    this.validateButtonState();
  }


  openStartTimeModal(isModal_Open: boolean) {
    this.isStartTimeModal = isModal_Open;
    this.cdref.detectChanges();
  }

  cancelStartTime() {
    this.cdref.detectChanges();
    this.popoverStartTime.cancel(true);
    this.openStartTimeModal(false);
  }

  doneStartTime() {
    this.cdref.detectChanges();
    this.popoverStartTime.confirm(true);
    this.openStartTimeModal(false);
  }

  openEndTimeModal(isModal_Open: boolean) {
    this.isEndTimeModal = isModal_Open;
    this.cdref.detectChanges();
  }

  doneEndTime() {
    this.cdref.detectChanges();
    this.popoverEndTime.confirm(true);
    this.openEndTimeModal(false);
  }

  cancelEndTime() {
    this.cdref.detectChanges();
    this.popoverEndTime.cancel(true);
    this.openEndTimeModal(false);
    this.cdref.detectChanges();
  }

  validateButtonState() {
    const startMoment = moment(this.start_time);
    const endMoment = moment(this.end_time);
    const durationMinutes = endMoment.diff(startMoment, 'minutes');
    this.isButtonEnabled = (durationMinutes === parseInt(this.bookingDetails.therapist_duration));
  }

  ionViewWillLeave() {
    this.isStartTimeModal = false;
    this.isEndTimeModal = false;
    this.startTimeLabel = "Start Time";
    this.endTimeLabel = "End Time";
    this.isButtonEnabled = false;
    this.start_time = null;
    this.end_time = null;
  }

  // async startRequest() {
  //   console.log("bookingDetails :", this.bookingDetails);
  //   const bookingDateTime = new Date(this.bookingDetails.booking_date + ' ' + this.bookingDetails.booking_start_time);
  //   const currentTime = new Date();
  //   if (currentTime < bookingDateTime) {
  //     this.commonService.presentAlert("You can't start the request before the scheduled time.");
  //     return;
  //   }

  //   let paylod = {
  //     token: this.loginUser.token,
  //     session_id: this.bookingId,
  //     status: this.bookingDetails.status
  //   }
  //   await this.commonService.showLoader("Please wait..");
  //   this.apiService.send('startSession', paylod).subscribe(async (res: any) => {
  //     await this.commonService.dismissLoading();
  //     this.commonService.presentToast(res.message, 'success');
  //     this.getBookingDetails();
  //   }, async (err) => {
  //     await this.commonService.dismissLoading();
  //     this.commonService.presentAlert(err.error.message);
  //   });
  // }

  async startRequest() {
    // console.log("bookingDetails:", this.bookingDetails);
    const timezone = this.bookingDetails?.timezone || 'UTC';
    const bookingDateTime = moment.tz(
      `${this.bookingDetails.booking_date} ${this.bookingDetails.start_time}`,
      'YYYY-MM-DD HH:mm',
      timezone
    );
    const currentTime = moment.tz(timezone);
    const allowedStartTime = bookingDateTime.clone().subtract(30, 'minutes');
    if (currentTime.isBefore(allowedStartTime)) {
      this.commonService.presentAlert("You can only start the session within 30 minutes of the scheduled time.");
      return;
    }

    let paylod = {
      token: this.loginUser.token,
      session_id: this.bookingId,
      status: this.bookingDetails.status
    };

    await this.commonService.showLoader("Please wait..");
    this.apiService.send('startSession', paylod).subscribe(
      async (res: any) => {
        await this.commonService.dismissLoading();
        this.commonService.presentToast(res.message, 'success');
        this.getBookingDetails();
      },
      async (err) => {
        await this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    );
  }

}
