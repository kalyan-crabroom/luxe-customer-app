import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { ChatService } from 'src/app/services/chat.service';
import { IonRadioGroup } from '@ionic/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  @ViewChild(IonRadioGroup) radioGroup!: IonRadioGroup;
  receivedData: any
  logUser: any
  ready: boolean = false;
  selectedPaymentMethodId: any;
  paymentMethodList: any = []
  isModalOpen: boolean = false;
  responseMessage: any = []
  tip: any = 18;
  tax: any = 7.38;
  roundedTip: any = []
  roundTax: any = []
  totalAmount: any = []
  therapist_id: any
  discountPercentage: number = 0;
  discountAmount: any = 0;
  membershipType: string = '';
  couponDiscountAmount: number = 0;
  couponData: any = [];
  couponCode: any = '';
  amountWithoutCoupon: number = 0;
  isCouponField: boolean = false;
  helptext: any;
  is_wallet_ready: boolean = false;
  wallet_amount: any = 0.00;
  wallet_amount_display: any = 0;
  disablePurachaseBtn: boolean = true;
  disableCardSection: boolean = false;
  isWallet: boolean = false;
  bookingData: any = {};

  member_plus: any = 7;
  member = 15;
  appSettingDetails: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storageService: StorageService,
    private commonService: CommonService,
    private cdref: ChangeDetectorRef,
    private chatService: ChatService,
  ) {
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'checkout');
    }
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.apiService.appSettingDetails.subscribe((appsetting: any) => {
      if (appsetting) {
        this.appSettingDetails = appsetting;
        this.tip = parseFloat(this.appSettingDetails.tip);
        console.log("Tip :", this.tip);
        this.tax = parseFloat(this.appSettingDetails.tax);
        console.log("Tax :", this.tax);
        this.member_plus = parseFloat(this.appSettingDetails.member_plus);
        this.member = parseFloat(this.appSettingDetails.member_normal);
        console.log("AppSettingDetails:", this.appSettingDetails);
      }

      this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
        if (user != null) {
          this.logUser = user;
          this.getCard(this.logUser);
          this.getWalletAmount();
          if (!this.logUser?.user_zipcode_timezone) {
            this.updateUserZipCodetimezone(this.logUser.zip_code);
          }
          // console.log("logUser :",this.logUser);
        }
      });

      this.storageService.getFromStorage('bookingData').then((data: any) => {
        if (data) {
          this.bookingData = data;
          // this.bookingData.price = parseFloat(this.bookingData.price) * parseInt(this.bookingData.selectedPeople.how_many_people);
          console.log("bookingData :", this.bookingData);
          if (this.bookingData.therapist_id) {
            this.therapist_id = this.bookingData.therapist_id;
          }
          const price = parseFloat(this.bookingData.totalPrice);
          this.roundedTip = ((this.tip / 100) * price).toFixed(2);
          this.roundTax = parseFloat(((this.tax / 100) * price).toFixed(2));

          let initialTotalAmount = price + parseFloat(this.roundedTip) + this.roundTax;

          if (this.bookingData.product_id === 'com.member.plus') {
            this.membershipType = 'com.member.plus';
            this.discountPercentage = this.member_plus;
          } else if (this.bookingData.product_id === 'com.member.normal') {
            this.discountPercentage = this.member;
            this.membershipType = 'com.member.normal';
          } else {
            this.discountPercentage = 0;
            this.membershipType = '';
          }

          const discountAmount = (this.discountPercentage / 100) * initialTotalAmount;
          this.discountAmount = discountAmount.toFixed(2);
          // Calculate final total price after applying the discount
          this.totalAmount = initialTotalAmount - parseFloat(this.discountAmount);
          // this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
          this.totalAmount = this.totalAmount.toFixed(2);
          this.amountWithoutCoupon = this.totalAmount;
          this.cdref.detectChanges();
        }
      });
    });
  }

  getCard(logUser: any) {
    let body = {
      user_token: logUser.token
    };
    this.ready = false;
    this.apiService.getSaveCards(body, logUser.token).subscribe((res: any) => {
      if (res.success) {
        this.paymentMethodList.cards = res.cards || [];
      } else {
        this.paymentMethodList.cards = []
      }
      this.ready = true;
    }, (err: any) => {
      this.ready = true;
      this.commonService.presentAlert(err?.error?.msg || 'Error fetching payment methods.');
    });
  }

  // goBack() {
  //   if (this.membershipType === 'com.member.plus' || this.membershipType === 'com.member.normal') {
  //     this.router.navigate(['/book-now2']);
  //   } else {
  //     this.router.navigate(['/book-now3']); 
  //   }
  // }

  goBack() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        formData: JSON.stringify(this.receivedData),
      }
    };
    if (this.membershipType === 'com.member.plus' || this.membershipType === 'com.member.normal') {
      this.router.navigate(['/book-now2'], navigationExtras);
    } else {
      this.router.navigate(['/book-now3'], navigationExtras);
    }
  }

  editLocation() {
    this.router.navigate(['/guest-details2']);
  }

  editDateTime() {
    this.router.navigate(['/book-now2']);

  }

  editClientFirst() {
    this.router.navigate(['/book-now-first-time-client']);
  }

  goDebitCard() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_name: 'checkout'
      }
    }
    this.router.navigate(['/add-debit-card'], navigationExtras);
  }

  selectCard(event: any) {
    console.log('inside the select card section.');
    // this.selectedPaymentMethodId = event.target.value;
    this.disablePurachaseBtn = false;
    this.cdref.detectChanges();
  }

  // onSubmit() {
  //   const payload: any = {
  //     token: this.logUser.token,
  //     how_many_people: this.bookingData.selectedPeople.how_many_people,
  //     isCouples: this.bookingData.isActiveCouple,
  //     back_to_back_session: this.bookingData.selectedPeople.back_to_back_session,
  //     treatment_id: this.bookingData.selectedTreatment.id,
  //     therapist_gender: this.bookingData.therapist_gender,
  //     male_if_female_is_unavailable: this.bookingData.male_if_female_is_unavailable,
  //     female_if_male_is_unavailable: this.bookingData.female_if_male_is_unavailable,
  //     therapist_duration: this.bookingData.therapist_duration,
  //     massage_for: this.bookingData.massage_for,
  //     notes_for_therapist: this.bookingData.notes_for_therapist,
  //     guest_details: this.bookingData.guestDetails ? this.bookingData.guestDetails : null,
  //     location_id: this.bookingData.selectedLocation.id,
  //     location_lat: this.bookingData.selectedLocation.loc_lat,
  //     location_long: this.bookingData.selectedLocation.loc_long,
  //     pet: this.bookingData.selectedLocation.pet,
  //     sheet: this.bookingData.selectedLocation.sheet,
  //     stair: this.bookingData.selectedLocation.stair,
  //     table: this.bookingData.selectedLocation.table,
  //     pressure_level: this.bookingData.preferences?.pressurelevel ?? null,
  //     music: this.bookingData.preferences?.music ?? null,
  //     communication_level: this.bookingData.preferences?.communicationlevel ?? null,      
  //     booking_date: this.bookingData.bookingDateTime.date,
  //     booking_start_time: this.bookingData.bookingDateTime.startTime,
  //     booking_end_time: this.bookingData.bookingDateTime.endTime,
  //     booking_amount: this.bookingData.totalPrice,
  //     tip: this.roundedTip,
  //     tax: this.roundTax,
  //     // discount:  this.discountPercentage,
  //     discount: this.discountAmount,
  //     total: this.totalAmount,
  //     card_id: this.selectedPaymentMethodId,
  //     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  //   };

  //   if (this.therapist_id) {
  //     payload.therapist_id = this.therapist_id;
  //   }

  //   if (this.couponDiscountAmount > 0) {
  //     payload.coupon_code = this.couponData?.coupon_code;
  //     payload.coupon_amount = this.couponDiscountAmount;
  //     payload.coupon_id = this.couponData.id;
  //     payload.coupon_type = this.couponData.type;
  //   }

  //   payload.is_wallet = false;

  //   if (this.isWallet) {
  //     payload.is_wallet = true;
  //   }

  //   console.log("payload :", payload);
  //   return false;

  //   if(this.couponDiscountAmount >= this.totalAmount){

  //   }

  //   if(!this.isWallet && !this.selectedPaymentMethodId){
  //     this.commonService.presentAlert("Please select the payment method.");
  //     return;
  //   }

  //   const total = parseFloat(this.totalAmount);
  //   const walletBalance = parseFloat(this.wallet_amount);
  //   if (this.isWallet && walletBalance < total && !this.selectedPaymentMethodId) {
  //     this.commonService.presentAlert("You don't have Luxe Touch Credits. Try another method, or purchase Luxe Touch Credits.");
  //     return;
  //   }


  //   this.commonService.showLoader();
  //   this.apiService.send('add-bookings', payload).subscribe(async (res: any) => {
  //     this.apiService.location_refresh.next(1);
  //     await this.storageService.removeFromStorage('bookingData')
  //     this.commonService.dismissLoading();
  //     this.responseMessage = res.message
  //     this.isModalOpen = true;
  //     this.cdref.detectChanges();
  //     this.sendBookingNotification(res.booking);
  //     // if (res.therapist_ids.length > 0) {
  //     //   res.therapist_ids.forEach((id: any) => {
  //     //     this.chatService.sendMessage(this.logUser.id, 'You have a new request', id);
  //     //   });
  //     // }
  //   }, (err: any) => {
  //     console.log('err', err);
  //     this.commonService.dismissLoading();
  //     if (err?.error?.message) {
  //       this.commonService.presentAlert(err?.error?.message);
  //     } else {
  //       this.commonService.presentAlert("Something went wrong, Please try again");
  //     }
  //   })
  // }

  onSubmit() {
    const total = parseFloat(this.totalAmount);
    const walletBalance = parseFloat(this.wallet_amount);
    const couponCoversTotal = this.couponDiscountAmount >= total;

    if (!this.isWallet && !this.selectedPaymentMethodId && !couponCoversTotal) {
      this.commonService.presentAlert("Please select the payment method.");
      return;
    }

    if (this.isWallet && walletBalance < total && !this.selectedPaymentMethodId && !couponCoversTotal) {
      this.commonService.presentAlert("You don't have Luxe Touch Credits. Try another method, or purchase Luxe Touch Credits.");
      return;
    }

    const payload: any = {
      token: this.logUser.token,
      how_many_people: this.bookingData.selectedPeople.how_many_people,
      isCouples: this.bookingData.isActiveCouple,
      back_to_back_session: this.bookingData.selectedPeople.back_to_back_session,
      treatment_id: this.bookingData.selectedTreatment.id,
      therapist_gender: this.bookingData.therapist_gender,
      male_if_female_is_unavailable: this.bookingData.male_if_female_is_unavailable,
      female_if_male_is_unavailable: this.bookingData.female_if_male_is_unavailable,
      therapist_duration: this.bookingData.therapist_duration,
      massage_for: this.bookingData.massage_for,
      notes_for_therapist: this.bookingData.notes_for_therapist,
      guest_details: this.bookingData.guestDetails || null,
      location_id: this.bookingData.selectedLocation.id,
      location_lat: this.bookingData.selectedLocation.loc_lat,
      location_long: this.bookingData.selectedLocation.loc_long,
      pet: this.bookingData.selectedLocation.pet,
      sheet: this.bookingData.selectedLocation.sheet,
      stair: this.bookingData.selectedLocation.stair,
      table: this.bookingData.selectedLocation.table,
      pressure_level: this.bookingData.preferences?.pressurelevel ?? null,
      music: this.bookingData.preferences?.music ?? null,
      communication_level: this.bookingData.preferences?.communicationlevel ?? null,
      booking_date: this.bookingData.bookingDateTime.originalDate,
      booking_start_time: this.bookingData.bookingDateTime.startTime,
      booking_end_time: this.bookingData.bookingDateTime.endTime,
      booking_amount: this.bookingData.totalPrice,
      tip: this.roundedTip,
      tax: this.roundTax,
      discount: this.discountAmount,
      total: this.totalAmount,
      timeZone: this.logUser?.user_zipcode_timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      is_wallet: this.isWallet
    };

    if (this.therapist_id) {
      payload.therapist_id = this.therapist_id;
    }

    if (this.couponDiscountAmount > 0) {
      payload.coupon_code = this.couponData?.coupon_code;
      payload.coupon_amount = this.couponDiscountAmount;
      payload.coupon_id = this.couponData.id;
      payload.coupon_type = this.couponData.type;
    }

    // Only include card_id if needed
    if (this.selectedPaymentMethodId && !couponCoversTotal) {
      payload.card_id = this.selectedPaymentMethodId;
    }

    console.log("payload :", payload);
    // return

    this.commonService.showLoader();
    this.apiService.send('add-bookings', payload).subscribe(async (res: any) => {
      this.apiService.location_refresh.next(1);
      await this.storageService.removeFromStorage('bookingData');
      this.commonService.dismissLoading();
      this.responseMessage = res.message;
      this.isModalOpen = true;
      this.cdref.detectChanges();
      this.sendBookingNotification(res.booking);
      this.selectedPaymentMethodId = '';
      this.couponCode = '';
      this.isWallet = false;

    }, (err: any) => {
      console.log('err', err);
      this.commonService.dismissLoading();
      if (err?.error?.message) {
        this.commonService.presentAlert(err.error.message);
      } else {
        this.commonService.presentAlert("Something went wrong, Please try again");
      }
    });
  }

  sendBookingNotification(data: any) {
    let payload = {
      token: this.logUser.token,
      booking_id: data.id,
      therapist_id: data.therapist_id,
      location_lat: data.location_lat,
      location_long: data.location_long
    }
    this.apiService.send('send-booking-notification', payload).subscribe((res: any) => {
      console.log("res :", res);
      // if (res.therapist_ids.length > 0) {
      //   res.therapist_ids.forEach((id: any) => {
      //     this.chatService.sendMessage(this.logUser.id, 'You have a new request', id);
      //   });
      // }
    }, (err) => {
      console.log("er :", err);
    });
  }

  goToHome() {
    this.isModalOpen = false;
    this.cdref.detectChanges();
    this.router.navigate(['/tabs/home']);
  }

  // applyCoupon() {
  //   if (!this.couponCode) {
  //     this.commonService.presentToast('Please enter the coupon code.', 'warning');
  //     return;
  //   }
  //   this.totalAmount = this.amountWithoutCoupon;
  //   this.couponDiscountAmount = 0
  //   this.couponData = [];

  //   let apiParam = {
  //     'token': this.logUser?.token,
  //     'coupon_code': this.couponCode
  //   }
  //   this.commonService.showLoader();
  //   this.apiService.send('verify-coupon', apiParam).subscribe((res: any) => {
  //     this.commonService.dismissLoading();
  //     if (res['status'] == 'ok') {
  //       this.couponData = res.data;

  //       if (this.couponData?.discount_type == 'fixed') {
  //         this.couponDiscountAmount = +this.couponData?.coupon_amount.toFixed(2);
  //       }

  //       if (this.couponData?.discount_type == 'percentage') {
  //         let couponPercent = this.couponData?.coupon_amount;
  //         let couponDiscount = (this.totalAmount * couponPercent) / 100;
  //         this.couponDiscountAmount = +couponDiscount.toFixed(2);
  //       }

  //       this.couponDiscountAmount = 500;

  //       if(this.couponDiscountAmount < this.totalAmount){
  //         this.totalAmount = this.totalAmount - this.couponDiscountAmount;

  //         if (this.wallet_amount >= this.totalAmount) {
  //           this.wallet_amount_display = this.totalAmount;
  //         } else {
  //           this.wallet_amount_display = this.wallet_amount;
  //         }
  //       }else{
  //         this.totalAmount = 0
  //         this.wallet_amount_display = this.wallet_amount;
  //       }

  //       this.cdref.detectChanges();
  //       this.commonService.presentToast('Coupon Applied!', 'success');
  //     }
  //   }, (err) => {
  //     this.commonService.dismissLoading();
  //     let errorMsg = 'Failed!';
  //     if (err?.error?.error_msg) {
  //       errorMsg = err.error.error_msg;
  //     }
  //     this.commonService.presentToast(errorMsg, 'warning');
  //   })
  // }

  applyCoupon() {
    if (!this.couponCode) {
      this.commonService.presentToast('Please enter the coupon code.', 'warning');
      return;
    }
    this.totalAmount = this.amountWithoutCoupon;
    this.couponDiscountAmount = 0;
    this.couponData = [];

    let apiParam = {
      'token': this.logUser?.token,
      'coupon_code': this.couponCode
    }

    this.commonService.showLoader();
    this.apiService.send('verify-coupon', apiParam).subscribe((res: any) => {
      this.commonService.dismissLoading();
      if (res['status'] == 'ok') {
        this.couponData = res.data;

        if (this.couponData?.discount_type == 'fixed') {
          this.couponDiscountAmount = +this.couponData?.coupon_amount.toFixed(2);
        }

        if (this.couponData?.discount_type == 'percentage') {
          let couponPercent = this.couponData?.coupon_amount;
          let couponDiscount = (this.totalAmount * couponPercent) / 100;
          this.couponDiscountAmount = +couponDiscount.toFixed(2);
        }

        if (this.couponDiscountAmount >= this.totalAmount) {
          // Coupon covers full amount, disable other payment methods
          // this.totalAmount = 0;
          this.disableCardSection = true;
          this.isWallet = false;
          this.disablePurachaseBtn = false; // Enable purchase button

          this.selectedPaymentMethodId = '';
          this.isWallet = false;
        } else {
          // Partial discount, allow wallet or card selection
          this.totalAmount -= this.couponDiscountAmount;

          if (this.wallet_amount >= this.totalAmount) {
            this.wallet_amount_display = this.totalAmount;
          } else {
            this.wallet_amount_display = this.wallet_amount;
          }

          this.disableCardSection = false;
          this.disablePurachaseBtn = true;
        }

        this.cdref.detectChanges();
        this.commonService.presentToast('Coupon Applied!', 'success');
      }
    }, (err) => {
      this.commonService.dismissLoading();
      let errorMsg = 'Failed!';
      if (err?.error?.error_msg) {
        errorMsg = err.error.error_msg;
      }
      this.commonService.presentToast(errorMsg, 'warning');
    });
  }


  setCoupon(isOpen: boolean = false) {
    this.isCouponField = isOpen;
  }

  getWalletAmount() {
    this.is_wallet_ready = true;
    this.apiService.fetchData('getWalletAmount', this.logUser.token).subscribe((res: any) => {
      this.is_wallet_ready = false;
      this.wallet_amount = res.wallet_amount;
      if (this.wallet_amount >= this.totalAmount) {
        this.wallet_amount_display = this.totalAmount;
      } else {
        this.wallet_amount_display = this.wallet_amount;
      }
    }, (err) => {
      this.is_wallet_ready = false;
    });
  }

  selectWalletAmount(event: any) {
    let isWallet = event.target.checked;
    this.isWallet = isWallet;
    if (isWallet && this.wallet_amount >= this.totalAmount) {
      this.disablePurachaseBtn = false;
      this.disableCardSection = true;
      this.selectedPaymentMethodId = '';
      this.radioGroup.value = null;
    } else {
      this.disableCardSection = false;
      this.disablePurachaseBtn = true;
    }
    if (this.selectedPaymentMethodId) {
      this.disablePurachaseBtn = false;
    }
    this.cdref.detectChanges();
  }

  updateUserZipCodetimezone(zipcode: any) {
    this.apiService.getTimezoneByZip(zipcode).subscribe(
      async (res: any) => {
        let timezone: any;
        console.log("getTimezoneByZip res:", res);
        if (res.timeZoneId) {
          timezone = res.timeZoneId;
        } else {
          timezone = this.apiService.getDeviceTimezone();
          console.log('Timezone not found, using device timezone:', timezone);
        }

        this.apiService.send('updateUserZipCodeTimezone', { timezone: timezone, token: this.logUser.token }).subscribe(
          async (updateRes: any) => {
            this.logUser.user_zipcode_timezone = updateRes.zipcode;
            await this.storageService.saveToStorage('deeplyCalm:user', this.logUser);
          },
          (err) => {
            console.log("Error updating timezone:", err);
          }
        );
      },
      (err) => {
        console.log("Error fetching timezone:", err);
      }
    );
  }

}
