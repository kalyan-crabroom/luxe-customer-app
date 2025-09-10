import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TreatmentModalPage } from 'src/app/commonpages/treatment-modal/treatment-modal.page';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-book-now-first-time-client',
  templateUrl: './book-now-first-time-client.page.html',
  styleUrls: ['./book-now-first-time-client.page.scss'],
})
export class BookNowFirstTimeClientPage implements OnInit {
  bookFirstTime: FormGroup
  people: number = 0;
  queryParamsData: any = {};
  selectedTreatment: any
  isEdit: Boolean = false;
  receiveData: any
  logUser: any
  totalPrice: any
  showMaleCheckbox: boolean = false;
  showFemaleCheckbox: boolean = false;
  therapist_data: any = []
  therapist_id: any
  product_id: any
  validation_messages = {
    treatment_id: [
      { type: 'required', message: "This Field is required." },
    ],
    therapist_gender: [
      { type: 'required', message: "This Field is required." },
    ],
    therapist_duration: [
      { type: 'required', message: "This Field is required." },
    ],
    notes_for_therapist: [
      { type: 'required', message: "This Field is required." },
    ],
    massage_for: [
      { type: 'required', message: "This Field is required." },
    ],

  }
  helptext: any;
  bookingData: any = {};
  constructor(
    private router: Router,
    private commonService: CommonService,
    private storageService: StorageService,
    public modalController: ModalController,
  ) {
    this.bookFirstTime = new FormGroup({
      therapist_gender: new FormControl("Any", Validators.required),
      therapist_duration: new FormControl("60", Validators.required),
      massage_for: new FormControl("", Validators.required),
      notes_for_therapist: new FormControl(""),
      male_if_female_is_unavailable: new FormControl(false),
      female_if_male_is_unavailable: new FormControl(false)
    });

    // this.bookFirstTime.get('therapist_gender')?.valueChanges.subscribe(value => {
    //   this.updateCheckboxVisibility(value);
    // });

    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'book_now2');
    }
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });

    this.storageService.getFromStorage('bookingData').then((data: any) => {
      if (data) {
        this.bookingData = data;
        if (this.bookingData.selectedTreatment) {
          this.selectedTreatment = this.bookingData.selectedTreatment;
          this.selectedTreatment.price_and_durations.sort((a: { duration: string; }, b: { duration: string; }) => parseInt(a.duration) - parseInt(b.duration));
          if (this.selectedTreatment.price_and_durations.length > 0) {
            this.bookFirstTime.patchValue({
              therapist_duration: this.selectedTreatment.price_and_durations[0].duration
            });
          }
        }

        if (this.bookingData.male_if_female_is_unavailable) {
          this.bookFirstTime.controls['male_if_female_is_unavailable'].setValue(this.bookingData.male_if_female_is_unavailable);
        }

        if (this.bookingData.notes_for_therapist) {
          this.bookFirstTime.controls['notes_for_therapist'].setValue(this.bookingData.notes_for_therapist);
        }

        if (this.bookingData.therapist_gender) {
          this.bookFirstTime.controls['therapist_gender'].setValue(this.bookingData.therapist_gender);
        }
        if (this.bookingData.therapist_duration) {
          this.bookFirstTime.controls['therapist_duration'].setValue(this.bookingData.therapist_duration);
        }

        // if (this.bookingData.massage_for) {
        //   this.bookFirstTime.controls['massage_for'].setValue(this.bookingData.massage_for);
        // }

        if (this.bookingData.price) {
          this.totalPrice = this.bookingData.price;
        }
        console.log("bookingData :", this.bookingData);
      }
    });
  }

  ngOnInit() {

  }

  isNotesValid(): boolean {
    const notes = this.bookFirstTime.get('notes_for_therapist')?.value.trim();
    return notes !== '';
  }

  // updateCheckboxVisibility(selectedGender: string) {
  //   this.showMaleCheckbox = selectedGender === 'Female';
  //   this.showFemaleCheckbox = selectedGender === 'Male';
  // }

  calculatePrice(): string {
    const therapistDuration = this.bookFirstTime.get('therapist_duration')?.value;
    if (this.selectedTreatment && this.selectedTreatment.price_and_durations) {
      const priceForDuration = this.selectedTreatment.price_and_durations.find((pd: any) => pd.duration === therapistDuration);
      if (priceForDuration) {
        const numericPrice = parseFloat(priceForDuration.price);
        this.totalPrice = numericPrice.toFixed(2);
        return this.totalPrice.toString();
      }
    }
    return '';
  }

  navigateToTreatmentModal() {
    this.router.navigate(['/treatment-modal']);
  }

  async openTreatmentModal() {
    const modal = await this.modalController.create({
      component: TreatmentModalPage,
      componentProps: {
        selectedTreatment: this.bookingData.selectedTreatment
      },
    });

    modal.onDidDismiss().then((modalRes: any) => {
      if (modalRes.data.selectedTreatment && modalRes.data.status == 'ok') {
        this.bookingData.selectedTreatment = modalRes.data.selectedTreatment;
        this.selectedTreatment = this.bookingData.selectedTreatment;
        this.selectedTreatment.price_and_durations.sort((a: { duration: string; }, b: { duration: string; }) => parseInt(a.duration) - parseInt(b.duration));
        if (this.selectedTreatment.price_and_durations.length > 0) {
          this.bookFirstTime.patchValue({
            therapist_duration: this.selectedTreatment.price_and_durations[0].duration
          });
        }
      }
    });
    return await modal.present();
  }

  async onSubmit(form: any) {
    if (!this.selectedTreatment) {
      this.commonService.presentAlert('Please select the treatment.');
      return;
    }
    console.log("form :", form);
    const trimmedNotes = form.notes_for_therapist ? form.notes_for_therapist.trim() : '';
    this.bookingData.male_if_female_is_unavailable = form.male_if_female_is_unavailable;
    this.bookingData.female_if_male_is_unavailable = form.female_if_male_is_unavailable;
    this.bookingData.notes_for_therapist = trimmedNotes;
    this.bookingData.therapist_gender = form.therapist_gender;
    this.bookingData.therapist_duration = form.therapist_duration;
    this.bookingData.massage_for = form.massage_for;
    this.bookingData.price = this.totalPrice;
    this.bookingData.totalPrice = this.totalPrice;
    if (form.massage_for === 'Myself') {
      this.bookingData.guestDetails = null;
      await this.storageService.saveToStorage('bookingData', this.bookingData);
      this.router.navigate(['/guest-details2']);
    } else {
      await this.storageService.saveToStorage('bookingData', this.bookingData);
      this.router.navigate(['/guest-details']);
    }
    this.bookFirstTime.reset();
  }

}



