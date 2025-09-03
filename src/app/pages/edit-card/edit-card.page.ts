import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.page.html',
  styleUrls: ['./edit-card.page.scss'],
})
export class EditCardPage implements OnInit {

  cardForm = new FormGroup({
    card_holder_name: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s]*$/)
    ])),
    card_number: new FormControl('', Validators.compose([
      Validators.required,
    ])),
    expiry_date: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{4})$/)
    ])),
  });
  card_details: any;
  expirationDate: any;
  validation_messages = {
    expiry_date: [
      { type: "required", message: "Expiration Date is required." },
      { type: "pattern", message: "Enter a valid date." }
    ],
    card_holder_name: [
      { type: "required", message: "Card Holder Name is required." },
      { type: "pattern", message: "Only alphabets are allowed" }
    ],
  };

  logUser: any;
  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private commonService: CommonService,
    private apiService: ApiService,
    private location: Location,
  ) {
    this.route.queryParams.subscribe((param: any) => {
      if (param.card_details) {
        this.card_details = JSON.parse(param.card_details);
        this.cardForm.controls['card_holder_name'].setValue(this.card_details?.card_holder_name);
        this.cardForm.controls['card_number'].setValue("***********" + this.card_details?.ending_in);
        this.expirationDate = this.card_details.exp_month + "/" + this.card_details.exp_year;
      }
    });

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });
  }

  ngOnInit() {
  }

  async onSubmit(form_data: any) {
    console.log("form_data:", form_data);
    form_data.card_id =  this.card_details.card_id;
    form_data.token = this.logUser.token;
    let date = form_data.expiry_date.split('/');
    form_data.exp_month = date[0],
    form_data.exp_year = date[1]

    await this.commonService.showLoader();
    this.apiService.send("update-card", form_data).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(res.message);
      this.location.back();
    }, async (err) => {
      console.log(err.error);
      await this.commonService.dismissLoading();
      await this.commonService.presentAlert(err.error.message);
    });

  }

  formatDate(event: any): void {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^0-9\/]/g, '');
    if (inputValue.length === 2 && !inputValue.includes('/')) {
      inputValue = inputValue + '/';
    }
    if (inputValue.length > 7) {
      inputValue = inputValue.slice(0, 7);
    }
    this.expirationDate = inputValue;

  }
}
