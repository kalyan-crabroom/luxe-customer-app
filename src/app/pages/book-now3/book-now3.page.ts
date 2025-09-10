import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-book-now3',
  templateUrl: './book-now3.page.html',
  styleUrls: ['./book-now3.page.scss'],
})
export class BookNow3Page implements OnInit {
  selectedCard: any
  receivedData: any;
  startTime: any = '';
  endTime: any = '';
  bookingDate: any = Date;
  bookingDateTime: any = { date: Date, startTime: '', endTime: '' };
  tip: any = 18;
  tax: any = 7.38;
  member_plus: any = 7;
  member = 15;
  appSettingDetails: any;
  therapist_id: any
  helptext: any;
  bookingData: any = {};
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private commonService: CommonService,
    private storage: StorageService
  ) {

    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'select_pricing');
    }

  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.apiService.appSettingDetails.subscribe((appsetting: any) => {
      if (appsetting) {
        this.appSettingDetails = appsetting;
        this.tip = parseFloat(this.appSettingDetails.tip);
        this.tax = parseFloat(this.appSettingDetails.tax);
        this.member_plus = parseFloat(this.appSettingDetails.member_plus);
        this.member = parseFloat(this.appSettingDetails.member_normal);
      }
    });

    this.storage.getFromStorage('bookingData').then((data: any) => {
      if (data) {
        this.bookingData = data;
        // this.bookingData.price = parseFloat(this.bookingData.price) * parseInt(this.bookingData.selectedPeople.how_many_people);
        const tipAmount = (this.tip / 100) * this.bookingData.totalPrice;
        const roundedTip = tipAmount.toFixed(2);
        console.log("tip 18% : ", roundedTip);

        const taxAmount = (this.tax / 100) * this.bookingData.totalPrice;
        const roundTax = taxAmount.toFixed(2);
        console.log("tax 7.38% : ", roundTax);

        // const totalPrice = parseFloat(this.bookingData.totalPrice) + parseFloat(roundedTip) + parseFloat(roundTax);
        // this.bookingData.totalAmount = totalPrice.toFixed(2);
        // console.log("After add tip and tax amount:", this.bookingData.totalAmount);

        const totalPrice = parseFloat(this.bookingData.totalPrice);
        this.bookingData.totalAmount = totalPrice.toFixed(2);
        console.log("After add tip and tax amount:", this.bookingData.totalAmount);

        this.bookingData.member_plus_price = (this.bookingData.totalAmount - (this.bookingData.totalAmount * (this.member_plus / 100))).toFixed(2);
        console.log("member_plus price:", this.bookingData.member_plus_price);

        this.bookingData.member_price = (this.bookingData.totalAmount - (this.bookingData.totalAmount * (this.member / 100))).toFixed(2);
        console.log("member price:", this.bookingData.member_price);

        if (this.bookingData.selectedCard) {
          this.selectedCard = this.bookingData.selectedCard;
        }
      }
    });
  }

  selectOption(title: string, price: number) {
    this.selectedCard = { title, price };
  }

  async continue() {
    this.bookingData.selectedCard = this.selectedCard;
    if (this.selectedCard.title === 'Subscribe and Save') {
      let parameter: NavigationExtras = {
        queryParams: {
          page: 'checkout'
        }
      };
      this.router.navigate(['/select-membership'], parameter);
    } else if (this.selectedCard.title === 'Pay As You Go') {
      await this.storage.saveToStorage('bookingData', this.bookingData);
      this.router.navigate(['/checkout']);
    }
  }

}
