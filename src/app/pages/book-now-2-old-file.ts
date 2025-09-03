import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RangeCustomEvent, ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';
declare var jQuery: any;

@Component({
    selector: 'app-book-now2',
    templateUrl: './book-now2.page.html',
    styleUrls: ['./book-now2.page.scss'],
    providers: [DatePipe]
})

export class BookNow2Page implements OnInit {
    receivedData: any;
    product_id: any
    selectedDate: any = new Date();
    timeRange: { lower: number, upper: number } = { lower: 480, upper: 1440 };
    currentDate: any = new Date();

    highlightedDates: any = [];
    dates: { date: number, day: string, fullDate: string }[] = [];
    dateSelected: number | null = null;
    clickedIndex: number | null = null;
    isEdit: boolean = false;
    durationInMinutes: number = 60;
    minDate: any = new Date().toISOString();
    therapist_id: any
    loginUser: any
    subscriptionData: any
    is_loader: boolean = false
    helptext: any;
    bookingData: any = {};
    is_modal: boolean = false;
    timezone: any = new Intl.DateTimeFormat().resolvedOptions().timeZone
    value: string = new Date().toISOString().split('T')[0];

    constructor(
        private datePipe: DatePipe,
        private router: Router,
        private modalController: ModalController,
        private commonService: CommonService,
        private storageService: StorageService,
        private api: ApiService,
        private cdref: ChangeDetectorRef
    ) {
        if (this.commonService.helptext.length > 0) {
            this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'book_now_date_page');
        }
        this.timeRange = this.updateTimeRangeIfToday(this.selectedDate);
    }

    getCurrentTimeInTimezone(timezone: any) {
        const options: any = { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: 'numeric', hour12: false };
        const formatter = new Intl.DateTimeFormat([], options);
        const parts: any = formatter.formatToParts(new Date());
        const hours: any = parts.find((part: any) => part.type === 'hour').value;
        const minutes: any = parts.find((part: any) => part.type === 'minute').value;
        return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
    }

    updateTimeRangeIfToday(selectedDate: any) {
        const today: any = moment();
        const selectedMoment = moment(selectedDate);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const currentTime = this.getCurrentTimeInTimezone(timezone);
        const currentMinutes = currentTime.hours * 60 + currentTime.minutes;

        if (selectedMoment.isSame(today, 'day')) {
            const futureMinutes = currentMinutes + 120;
            const roundedLower = this.roundUpToStep(Math.max(futureMinutes, 480), 15);
            const duration = this.durationInMinutes;
            const roundedUpper = roundedLower + duration;

            if (roundedUpper <= 1440) {
                return {
                    lower: roundedLower,
                    upper: roundedUpper
                };
            } else {
                const adjustedLower = 1440 - duration;
                return {
                    lower: adjustedLower,
                    upper: 1440
                };
            }
        } else {
            return {
                lower: 480,
                upper: 480 + this.durationInMinutes,
            };
        }
    }

    openCalendar(is_modal: boolean) {
        this.is_modal = is_modal;
        setTimeout(() => {
            const ionDatetime = jQuery("ion-datetime")[0];
            if (ionDatetime) {
                if (this.selectedDate) {
                    const formattedDate = moment(this.selectedDate).format('YYYY-MM-DD');
                    ionDatetime.value = formattedDate;
                }
                var data = jQuery(ionDatetime.shadowRoot.childNodes)[2];
                var dayOfWeekElements = jQuery(data).find('.day-of-week');
                if (dayOfWeekElements.length > 0) {
                    dayOfWeekElements.each(function (e: any) {
                        var element = jQuery(dayOfWeekElements[e]);
                        var text = element.text();
                        element.text(text.substring(0, 1));
                    });
                } else {
                    var data = jQuery(ionDatetime.shadowRoot.childNodes)[1];
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
            }
        }, 100);

        this.highlightedDates = [{
            date: moment(this.selectedDate).toDate(),
            textColor: 'rgb(68, 10, 184)',
            backgroundColor: 'rgb(211, 200, 229)',
        }];
        this.cdref.detectChanges();
    }

    selectDate(selectedDate: any, index: any) {
        if (selectedDate) {
            const clickedDate = new Date(selectedDate.fullDate);
            this.selectedDate = clickedDate;
            this.timeRange = this.updateTimeRangeIfToday(this.selectedDate);
            this.dateSelected = selectedDate.date;
            this.clickedIndex = index;
            this.currentDate = clickedDate;
        }
    }

    ionViewWillEnter() {
        this.populateDates();
        this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
            if (user != null) {
                this.loginUser = user; //user_zipcode_timezone
                this.getPurchaseSubscription();
            }
        });

        this.storageService.getFromStorage('bookingData').then((data: any) => {
            if (data) {
                this.bookingData = data;
                console.log("bookingData :", this.bookingData);
                this.durationInMinutes = this.calculateDurationInMinutes(this.bookingData.therapist_duration, this.bookingData.selectedPeople.how_many_people);
                const bookingDate = this.bookingData?.bookingDateTime?.date
                    ? new Date(this.bookingData.bookingDateTime.date)
                    : null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (bookingDate && bookingDate >= today) {
                    this.currentDate = new Date(this.bookingData.bookingDateTime.date);
                    this.dateSelected = this.bookingData.bookingDateTime.date;
                    const currentDateIndex = this.dates.findIndex(date => {
                        return date.date === this.currentDate.getDate() && date.day === this.getDayName(this.currentDate.getDay());
                    });

                    if (currentDateIndex !== -1) {
                        this.clickedIndex = currentDateIndex;
                    }

                    this.selectedDate = new Date(this.bookingData.bookingDateTime.date);

                    const lower = this.getMinutesFromTime(this.bookingData.bookingDateTime.startTime);
                    let upper = lower + this.durationInMinutes;

                    if (upper > 1440) {
                        upper = 1440;
                    }

                    this.timeRange = { lower, upper };
                    this.cdref.detectChanges();
                } else {

                    this.currentDate = new Date();
                    const currentDateIndex = this.dates.findIndex(date => {
                        return (
                            date.date === this.currentDate.getDate() &&
                            date.day === this.getDayName(this.currentDate.getDay())
                        );
                    });

                    if (currentDateIndex !== -1) {
                        this.clickedIndex = currentDateIndex;
                    }

                    const selectedMoment = moment(this.currentDate);
                    const today = moment();
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const currentTime = this.getCurrentTimeInTimezone(timezone);
                    const currentMinutes = currentTime.hours * 60 + currentTime.minutes;

                    if (selectedMoment.isSame(today, 'day')) {
                        const futureMinutes = currentMinutes + 120;
                        const roundedLower = this.roundUpToStep(Math.max(futureMinutes, 480), 15);
                        const upper = roundedLower + this.durationInMinutes;
                        if (upper <= 1440) {
                            this.timeRange = {
                                lower: roundedLower,
                                upper: upper
                            };
                        } else {
                            const adjustedLower = 1440 - this.durationInMinutes;
                            this.timeRange = {
                                lower: adjustedLower,
                                upper: 1440
                            };
                        }
                    } else {
                        this.timeRange = {
                            lower: 480,
                            upper: 480 + this.durationInMinutes
                        };
                    }
                }
                this.changeRangeSliderDesign();
            }
        });
    }

    roundUpToStep(value: number, step: number): number {
        return Math.ceil(value / step) * step;
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.changeRangeSliderDesign();
    }

    patchFormValues() {
        if (this.receivedData && this.receivedData.bookingDateTime) {
            const bookingDateTime = this.receivedData.bookingDateTime;
            this.selectedDate = new Date(bookingDateTime.date);
            this.timeRange.lower = this.getMinutesFromTime(bookingDateTime.startTime),
                this.timeRange.upper = this.getMinutesFromTime(bookingDateTime.endTime)
            this.cdref.detectChanges();
        }
    }

    calculateDurationInMinutes(duration: string, how_many_people: any): number {
        if (!duration) {
            return 60 * Number(how_many_people || 1);
        }

        const durationStr = duration.toLowerCase();
        const numericPart = parseInt(durationStr.match(/\d+/)?.[0] || '60', 10);
        return numericPart * Number(how_many_people || 1);
    }

    getMinutesFromTime(time: string): number {
        const [hour, minutePart] = time.split(':');
        const minutes = parseInt(minutePart.split(' ')[0], 10);
        const isPM = minutePart.includes('PM');
        return (parseInt(hour, 10) % 12 + (isPM ? 12 : 0)) * 60 + minutes;
    }

    getDayName(dayIndex: number): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayIndex];
    }

    populateDates() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let currentDate: any = '';
        if (this.selectedDate) {
            currentDate = new Date(this.selectedDate);
        } else {
            currentDate = new Date();
        }
        this.dates = [];
        for (let i = 0; i < 14; i++) {
            const date: any = new Date(currentDate);
            date.setDate(currentDate.getDate() + i);
            this.dates.push({
                date: date.getDate(),
                day: days[date.getDay()],
                fullDate: date
            });
        }
    }

    isToday(date: Date): boolean {
        const today = new Date();
        return today.toDateString() === date.toDateString();
    }

    isTomorrow(date: Date): boolean {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toDateString() === date.toDateString();
    }

    getPurchaseSubscription() {
        this.is_loader = true;
        this.api.fetchData('get-subscription-by-user', this.loginUser.token).subscribe(
            (res: any) => {
                console.log('Subscription Response:', res);
                this.subscriptionData = res.data;
                this.is_loader = false;
            },
            (err: any) => {
                this.is_loader = false;
                console.log('Error fetching subscription data:', err);
            }
        );
    }

    isValidDate(date: any): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }

    async goToNext() {
        if (!this.isValidDate(this.selectedDate)) {
            const errorMessage = 'Please select a date.';
            this.commonService.presentAlert(errorMessage);
            return;
        }
        const currentDate = new Date();
        const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
        const isToday = this.isToday(this.selectedDate);

        // Adjusted condition for 2 hours buffer
        if (isToday && this.timeRange.lower < currentMinutes + 120) {
            const errorMessage = 'The booking start time must be at least 2 hours from the current time.';
            this.commonService.presentAlert(errorMessage);
            return;
        }

        let day: string;
        if (this.isToday(this.selectedDate)) {
            day = 'Today';
        } else if (this.isTomorrow(this.selectedDate)) {
            day = 'Tomorrow';
        } else {
            day = this.getDayName(this.selectedDate.getDay());
        }
        const formattedSelectedDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
        const bookingDateTime = {
            date: formattedSelectedDate,
            day: day,
            startTime: this.getTimeFromMinutes(this.timeRange.lower),
            endTime: this.getTimeFromMinutes(this.timeRange.upper)
        };

        console.log("subscriptionData :", this.subscriptionData);
        this.bookingData.bookingDateTime = bookingDateTime;
        if (this.subscriptionData) {
            if (this.subscriptionData.subscription_status === 'active') {
                this.bookingData.subscription_status = this.subscriptionData.subscription_status;
                if (this.subscriptionData.product_id === 'com.member.plus') {
                    this.bookingData.product_id = 'com.member.plus';
                } else if (this.subscriptionData.product_id === 'com.member.normal') {
                    this.bookingData.product_id = 'com.member.normal';
                }
                await this.storageService.saveToStorage('bookingData', this.bookingData);
                this.router.navigate(['/checkout']);
            } else {
                await this.storageService.saveToStorage('bookingData', this.bookingData);
                this.router.navigate(['/book-now3']);
            }
        } else {
            console.log("bookingData :", this.bookingData);
            await this.storageService.saveToStorage('bookingData', this.bookingData);
            this.router.navigate(['/book-now3']);
        }
    }

    getTimeFromMinutes(minutes: number): string {
        if (minutes >= 1440) minutes = 0; // wrap around to 0:00 AM

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = mins < 10 ? '0' + mins : mins;
        return `${formattedHours}:${formattedMinutes} ${period}`;
    }

    onIonChange(ev: Event) {
        const value = (ev as RangeCustomEvent).detail.value as { lower: number, upper: number };
        if (value) {
            let { lower, upper } = value;
            const minimumDuration = this.durationInMinutes;
            if (upper - lower < minimumDuration) {
                upper = lower + minimumDuration;
            }
            this.timeRange = { lower, upper };
            this.getTimeFromMinutes(lower);
            this.getTimeFromMinutes(upper);
        }
    }

    pinFormatter = (value: number): string => {
        return this.getTimeFromMinutes(value);
    };

    async onDateSelected(event: any) {
        const newSelectedDate = moment(event.detail.value).toDate();
        console.log("newSelectedDate :", newSelectedDate);
        this.selectedDate = newSelectedDate;
        this.dates = [];
        this.populateDates();
        this.timeRange = this.updateTimeRangeIfToday(this.selectedDate);
        if (newSelectedDate.getMonth() !== this.currentDate.getMonth()) {
            this.selectedDate = newSelectedDate;
        } else {
            this.currentDate = newSelectedDate;
            this.selectedDate = newSelectedDate;
            const selectedIndex = this.dates.findIndex(date => date.date === this.selectedDate.getDate());
            if (selectedIndex !== -1) {
                this.clickedIndex = selectedIndex;
            }
        }
        this.is_modal = false;
    }

    async confirmDate() {
        const modal = await this.modalController.getTop();
        if (modal) {
            await modal.dismiss();
        }
    }

    changeRangeSliderDesign() {
        const barElement = document.querySelector('.pin-style-custom');
        if (barElement && barElement.shadowRoot) {
            const rangeKnob = barElement.shadowRoot.querySelector('.range-knob-b .range-pin');
            if (rangeKnob) {
                rangeKnob.setAttribute('part', 'pin bottom-range');
            }
        }
    }

}
