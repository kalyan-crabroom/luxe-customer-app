import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
import { TreatmentModalPage } from 'src/app/commonpages/treatment-modal/treatment-modal.page';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-guest-details',
  templateUrl: './guest-details.page.html',
  styleUrls: ['./guest-details.page.scss'],
})
export class GuestDetailsPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;
  guestDetailForm: FormGroup;
  receivedData: any;
  maxGuests: any;
  therapist_id: any
  validation_messages = {
    first_name: [
      { type: 'required', message: 'First Name is required.' },
      { type: "pattern", message: "Only alphabets are allowed" }
    ],
    last_name: [
      { type: 'required', message: 'Last Name is required.' },
      { type: "pattern", message: "Only alphabets are allowed" }
    ],
    phone: [
      { type: 'required', message: 'Phone number is required.' },
      { type: 'minlength', message: 'Minimum 10-12 digits are allowed.' },
      { type: 'maxlength', message: 'Maximum 12 digits are allowed.' },
      // { type: "pattern", message: "Only numbers are allowed" }
    ],
    guestIdentity: [
      { type: 'required', message: 'Guest Identity is required.' }
    ],
    therapist_gender: [
      { type: 'required', message: 'Therapist Gender is required.' }
    ],
  };
  helptext: any;
  bookingData: any = {};
  newGuestIndex: number = -1;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private storage: StorageService,
    public modalController: ModalController,
    public cdref : ChangeDetectorRef
  ) {
    this.guestDetailForm = this.formBuilder.group({
      guest_details: this.formBuilder.array([])
    });
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'guest_details');
    }
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.storage.getFromStorage('bookingData').then((data: any) => {
      if (data) {
        this.bookingData = data;
        this.setMaxGuests();
        this.addGuest();
        console.log("bookingData :", this.bookingData);
      }
    });
  }

  get guest_details(): FormArray {
    return this.guestDetailForm.get('guest_details') as FormArray;
  }

  setMaxGuests() {
    switch (this.bookingData.massage_for) {
      case '1 Guest':
      case 'Myself + 1 Guest':
        this.maxGuests = 1;
        break;
      case '2 Guests':
      case 'Myself + 2 Guests':
        this.maxGuests = 2;
        break;
      case '3 Guests':
      case 'Myself + 3 Guests':
        this.maxGuests = 3;
        break;
      case '4 Guests':
        this.maxGuests = 4;
        break;
      default:
        this.maxGuests = 1;
        break;
    }
  }

  addGuest() {
    if (this.bookingData.guestDetails && this.bookingData.guestDetails.length > 0) {
      this.guest_details.clear();
      this.guest_details.push(this.createGuest(this.bookingData.guestDetails[0]));
      this.newGuestIndex = this.guest_details.controls.length - 1;
      // this.bookingData.guestDetails.forEach((element: any) => {
      //   if(element && this.bookingData.guestDetails.length <= this.maxGuests ){
      //     this.guest_details.push(this.createGuest(element));
      //   }
      // });
      console.log("if");
    } else {
      this.addGuestCustom();
    }
  }

  addGuestCustom() {

    if (this.guest_details.length < this.maxGuests) {
      if (this.bookingData?.guestDetails && this.bookingData.guestDetails[this.guest_details.length]) {
        this.guest_details.push(this.createGuest(this.bookingData.guestDetails[this.guest_details.length]));
      } else {
        if (this.bookingData.selectedPeople.cardType == "Back-to-back" && this.bookingData.selectedPeople.how_many_people == 2 && this.bookingData.massage_for == "Myself + 1 Guest") {
          let temp = { therapist_gender: this.bookingData.therapist_gender };
          this.guest_details.push(this.createGuest(temp,true));
        } else if (this.bookingData.selectedPeople.cardType == "Back-to-back" && this.bookingData.selectedPeople.how_many_people == 2 && this.bookingData.massage_for == "2 Guests") {
          const firstGuest = this.guest_details?.value[0];
          this.guest_details.push(this.createGuest({ therapist_gender: firstGuest?.therapist_gender }, true));
        } else if (this.bookingData.selectedPeople.cardType == "Back-to-back" && this.bookingData.selectedPeople.how_many_people == 3 && this.bookingData.massage_for == "Myself + 2 Guests") {
          let temp = { therapist_gender: this.bookingData.therapist_gender };
          this.guest_details.push(this.createGuest(temp,true));
        } else if (this.bookingData.selectedPeople.cardType == "Back-to-back" && this.bookingData.selectedPeople.how_many_people == 3 && this.bookingData.massage_for == "3 Guests") {
          const firstGuest = this.guest_details?.value[0];
          this.guest_details.push(this.createGuest({ therapist_gender: firstGuest?.therapist_gender }, true));
        } else if (this.bookingData.selectedPeople.cardType == "Back-to-back" && this.bookingData.selectedPeople.how_many_people == 4 && this.bookingData.massage_for == "Myself + 3 Guests") {
          let temp = { therapist_gender: this.bookingData.therapist_gender };
          this.guest_details.push(this.createGuest(temp,true));
        } else if (this.bookingData.selectedPeople.cardType == "Back-to-back" && this.bookingData.selectedPeople.how_many_people == 4 && this.bookingData.massage_for == "4 Guests") {
          const firstGuest = this.guest_details?.value[0];
          this.guest_details.push(this.createGuest({ therapist_gender: firstGuest?.therapist_gender }, true));
        } else {
          this.guest_details.push(this.createGuest());
        }
      }
      this.cdref.detectChanges();
    }
    this.content.scrollToTop(500);
    this.newGuestIndex = this.guest_details.length - 1;

    console.log("this.guest_details.getRawValue() :",this.guest_details.getRawValue());
    
  }


  createGuest(element: any = '', disabled = false): FormGroup {
    return this.formBuilder.group({
      first_name: [element.first_name ? element.first_name : '', [Validators.required]],// Validators.pattern(/^[A-Za-z]+([a-zA-Z\s]*[A-Za-z])?$/)
      last_name: [element.last_name ? element.last_name : '', [Validators.required]],
      // phone: [element.phone ? element.phone : '', [
      //   Validators.required,
      //   Validators.minLength(10),
      //   Validators.maxLength(12),
      //   Validators.pattern(/^\S+$/)
      // ]],
      guestIdentity: [element.guestIdentity ? element.guestIdentity : '', Validators.required],
      is_minor: [element.is_minor ? element.is_minor : false],
      selectedTreatment: [element?.selectedTreatment || null],
      therapist_duration: [element?.therapist_duration || null],
      price: [element?.price || 0],
      therapist_gender: [element.therapist_gender ? { value: element.therapist_gender || '', disabled: disabled } : '', Validators.required],
      male_if_female_is_unavailable: [element.male_if_female_is_unavailable ? element.male_if_female_is_unavailable : false],
      female_if_male_is_unavailable: [element.female_if_male_is_unavailable ? element.female_if_male_is_unavailable : false],
      // pressurelevel :  [element.pressurelevel ? element.pressurelevel : ''],
      // communicationlevel :  [element.communicationlevel ? element.communicationlevel : '']
    });
  }

  removeGuest(index: number) {
    this.guest_details.removeAt(index);
  }

  async onSubmit() {
    if (this.guest_details.length < this.maxGuests) {
      this.commonService.presentAlert('Please add the another guest details.');
      return;
    }
    // this.bookingData.guestDetails = this.guestDetailForm.value.guest_details;
      this.bookingData.guestDetails = this.guest_details.getRawValue();
    if (this.bookingData.massage_for == "1 Guest") {
      this.bookingData.guestDetails.forEach((element: any) => {
        if (element.selectedTreatment) {
          this.bookingData.totalPrice = element.price;
        } else {
          this.bookingData.totalPrice = this.bookingData.price;
        }
      });
    } else if (this.bookingData.massage_for == "Myself + 1 Guest") {
      this.bookingData.guestDetails.forEach((element: any) => {
        if (element.selectedTreatment) {
          this.bookingData.totalPrice = (Number(element.price) + Number(this.bookingData.price)).toFixed(2).toString();
        } else {
          this.bookingData.totalPrice = (Number(this.bookingData.price) + Number(this.bookingData.price)).toFixed(2).toString();
        }
      });
    } else if (this.bookingData.massage_for == "Myself + 2 Guests" || this.bookingData.massage_for == "Myself + 3 Guests") {
      this.bookingData.guestDetails.forEach((element: any) => {
        if (element.selectedTreatment) {
          this.bookingData.totalPrice = (Number(element.price) + Number(this.bookingData.totalPrice)).toFixed(2).toString();
        } else {
          this.bookingData.totalPrice = (Number(this.bookingData.price) + Number(this.bookingData.totalPrice)).toFixed(2).toString();
        }
      });
    } else if (this.bookingData.massage_for == "2 Guests" || this.bookingData.massage_for == "3 Guests" || this.bookingData.massage_for == "4 Guests") {
      this.bookingData.totalPrice = "0";
      this.bookingData.guestDetails.forEach((element: any) => {
        if (element.selectedTreatment) {
          this.bookingData.totalPrice = (Number(element.price) + Number(this.bookingData.totalPrice)).toFixed(2).toString();
        } else {
          this.bookingData.totalPrice = (Number(this.bookingData.price) + Number(this.bookingData.totalPrice)).toFixed(2).toString();
        }
      });
    }
    await this.storage.saveToStorage('bookingData', this.bookingData);
    this.router.navigate(['/guest-details2']);
  }

  async openTreatmentModal(index: any) {
    const modal = await this.modalController.create({
      component: TreatmentModalPage,
      componentProps: {
        selectedTreatment: this.guest_details.at(index)?.value.selectedTreatment || null,
        index: index,
      },
    });

    modal.onDidDismiss().then((modalRes: any) => {
      if (modalRes.data?.selectedTreatment && modalRes.data.status === 'ok') {
        this.guest_details.at(modalRes.data.index).patchValue({
          selectedTreatment: modalRes.data.selectedTreatment,
          therapist_duration: modalRes.data.selectedTreatment.price_and_durations[0].duration,
          price: parseFloat(modalRes.data.selectedTreatment.price_and_durations[0].price).toFixed(2)
        });
      }
    });

    return await modal.present();
  }

  updateDuraionPrice(event: any, index: any) {
    const priceForDuration = this.guestDetailForm.get(['guest_details', index, 'selectedTreatment'])?.value.price_and_durations.find((pd: any) => pd.duration === event.target.value);
    this.guest_details.at(index).patchValue({
      price: parseFloat(priceForDuration.price).toFixed(2)
    });
  }

  isGuestValid(index: number): boolean {
    const guestGroup = this.guest_details.at(index) as FormGroup;
    return guestGroup.valid;
  }


}
