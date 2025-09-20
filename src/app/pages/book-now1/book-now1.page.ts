import { Component, OnInit, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

declare var google: any;

@Component({
  selector: 'app-book-now1',
  templateUrl: './book-now1.page.html',
  styleUrls: ['./book-now1.page.scss'],
})
export class BookNow1Page implements OnInit {
  bookNow1: FormGroup;
  receivedData: any;
  isEdit: boolean = false;
  logUser: any
  latitude: any;
  longitude: any;
  allLocations: any = [];
  address: any;
  location: any
  locationId: any
  service = new google.maps.places.AutocompleteService();

  // Custom validator for street addresses
  static streetAddressValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.trim();

    // Check if the address contains a street number (starts with digits)
    const hasStreetNumber = /^\d+/.test(value);

    // Check if it contains common street address indicators
    const hasStreetIndicators = /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place|way|cir|circle)\b/i.test(value);

    // Check if it's just a city name (common patterns to reject)
    const isJustCity = /^[A-Za-z\s,]+$/.test(value) && !hasStreetNumber && !hasStreetIndicators && value.split(',').length <= 2;

    if (!hasStreetNumber && !hasStreetIndicators) {
      return { invalidStreetAddress: true };
    }

    if (isJustCity) {
      return { cityNotAllowed: true };
    }

    return null;
  }

  validation_messages = {
    location_name: [
      { type: 'required', message: "This Field is required." },
      { type: "pattern", message: "Only alphabets are allowed" }
    ],
    location_address: [
      { type: 'required', message: "This Field is required." },
      { type: "pattern", message: "Only alphabets are allowed" },
      { type: "invalidStreetAddress", message: "Please enter a complete street address with street number and street name." },
      { type: "cityNotAllowed", message: "City names are not allowed. Please enter a complete street address." }
    ],
    location_type: [
      // { type: 'required', message: "This Field is required." },
      { type: "pattern", message: "Only alphabets are allowed" }
    ],
    table: [
      { type: 'required', message: "This Field is required." },
    ],
    parking_directions: [
      { type: 'required', message: "This Field is required." },
      { type: "pattern", message: "Only alphabets are allowed" }
    ],
    sheet: [
      { type: 'required', message: "This Field is required." },
    ],
    stair: [
      { type: 'required', message: "This Field is required." },
    ],
    pet: [
      { type: 'required', message: "This Field is required." },
    ]
  }
  helptext: any;
  isAddNewLoc: any;
  prev_page: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private commonService: CommonService,
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.bookNow1 = new FormGroup({
      location_name: new FormControl(''),//[Validators.required, Validators.pattern(/^\s*\S.*\S\s*$/)]
      location_address: new FormControl('', [Validators.required, Validators.pattern(/^\s*\S.*\S\s*$/), BookNow1Page.streetAddressValidator]),
      // location_type: new FormControl('', Validators.pattern(/^\s*\S.*\S\s*$/)),
      location_type: new FormControl(''),
      // parking_directions: new FormControl('', [Validators.pattern(/^\s*\S.*\S\s*$/)]),
      parking_directions: new FormControl('', [Validators.pattern(/^(?!\s*$).+/)]),
      table: new FormControl('', Validators.required),
      sheet: new FormControl('', Validators.required),
      stair: new FormControl('', Validators.required),
      pet: new FormControl('', Validators.required),
    });

    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'add_location');
    }
  }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.route.queryParams.subscribe((params: any) => {
          if (params) {
            this.isAddNewLoc = params.addNewLoc;
            if (this.isAddNewLoc == 'true') {
              this.bookNow1.reset();
            }

            if (params.isEdit) {
              this.isEdit = true;
            }

            if (params.page) {
              this.prev_page = params.page;
            }

            if (params.locationId) {
              this.locationId = params.locationId;
              if (this.logUser) {
                this.getLocationDetails(this.locationId);
              }
            }
          }
        });
      }
    });


  }


  async getLocationDetails(locationId: any) {
    const payload = {
      location_id: locationId,
      token: this.logUser.token
    }
    await this.commonService.showLoader()
    this.apiService.send('getLocationById', payload).subscribe(async (res: any) => {
      console.log('ress', res);
      await this.commonService.dismissLoading()
      this.bookNow1.patchValue({
        location_name: res.data.location_name,
        location_address: res.data.location_address,
        location_type: res.data.location_type,
        parking_directions: res.data.parking_directions,
        table: res.data.table,
        sheet: res.data.sheet,
        stair: res.data.stair,
        pet: res.data.pet,
      });
      this.address = res.data.location_address;
      this.latitude = res.data.loc_lat;
      this.longitude = res.data.loc_long;
    }, async (err: any) => {
      await this.commonService.dismissLoading();
      if (err?.error?.message) {
        this.commonService.presentAlert(err?.error?.message);
      } else {
        this.commonService.presentAlert("Something went wrong, Please try again");
      }

    });
  }


  patchFormValues() {
    if (this.receivedData) {
      this.bookNow1.patchValue({
        location_name: this.receivedData.location_name,
        location_address: this.receivedData.location_address,
        location_type: this.receivedData.location_type,
        parking_directions: this.receivedData.parking_directions,
        table: this.receivedData.table,
        sheet: this.receivedData.sheet,
        stair: this.receivedData.stair,
        pet: this.receivedData.pet,
      });
      this.address = this.receivedData.location_address;
      this.latitude = this.receivedData.loc_lat;
      this.longitude = this.receivedData.loc_long;
    }
  }

  onSubmit(formData: any) {
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = formData[key].trim();
      }
    });
    if (!this.latitude || !this.longitude) {
      this.commonService.presentAlert('Please enter a valid address.');
      return;
    }

    formData.loc_lat = parseFloat(this.latitude);
    formData.loc_long = parseFloat(this.longitude);
    formData.token = this.logUser.token;
    console.log(!this.isEdit + "" + !this.locationId)
    this.commonService.showLoader();

    if (!this.isEdit && !this.locationId) {
      this.apiService.send('add-location', formData).subscribe({
        next: (res: any) => {
          this.commonService.dismissLoading();
          console.log('res', res);
          this.apiService.location_refresh.next(1);
          this.commonService.presentToast(res.message, 'succcess');
          if (this.prev_page == 'guest-details2') {
            this.router.navigate(['/guest-details2']);
          } else if (this.prev_page == 'tabs/myaccount') {
            this.router.navigate(['/tabs/myaccount']);
          } else {
            this.router.navigate(['/tabs/myaccount']);
          }
        },
        error: (err: any) => {
          this.commonService.dismissLoading();
          if (err?.error?.message) {
            this.commonService.presentAlert(err?.error?.message);
          } else {
            this.commonService.presentAlert("Something went wrong, Please try again");
          }
        }
      });
    } else {
      formData.location_id = this.locationId;
      this.apiService.send('update-location', formData).subscribe({
        next: (res: any) => {
          this.apiService.location_refresh.next(1);
          this.commonService.dismissLoading();
          if (this.prev_page == 'guest-details2') {
            this.router.navigate(['/guest-details2']);
          } else if (this.prev_page == 'tabs/myaccount') {
            this.router.navigate(['/tabs/myaccount']);
          } else {
            this.router.navigate(['/tabs/myaccount']);
          }
        },
        error: (err: any) => {
          this.commonService.dismissLoading();
          if (err?.error?.message) {
            this.commonService.presentAlert(err?.error?.message);
          } else {
            this.commonService.presentAlert("Something went wrong, Please try again");
          }
        }
      });
    }
  }


  getLocation(event: any) {
    if (this.address == '') {
      this.allLocations = [];
      return;
    }
    let self = this;
    this.service.getPlacePredictions({
      input: this.address,
      types: ['address'], // Filter for addresses only, not establishments
      componentRestrictions: { country: 'us' } // Restrict to US addresses
    }, (predictions: any, status: any) => {
      self.allLocations = [];
      self.zone.run(() => {
        if (predictions != null) {
          predictions.forEach((prediction: any) => {
            // Additional filtering to ensure it's a street address
            if (self.isValidStreetAddress(prediction.description)) {
              self.allLocations.push(prediction.description);
            }
          });
        }
      });
    })
  }

  // Helper method to validate if the prediction is a valid street address
  isValidStreetAddress(address: string): boolean {
    // Check if it contains a street number
    const hasStreetNumber = /^\d+/.test(address);

    // Check if it contains street indicators
    const hasStreetIndicators = /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place|way|cir|circle)\b/i.test(address);

    // Reject if it's just a city name or business name without street info
    const isJustCityOrBusiness = !hasStreetNumber && !hasStreetIndicators;

    return !isJustCityOrBusiness;
  }

  chooseLocation(item: any) {
    this.allLocations = [];
    this.bookNow1.controls['location_address'].setValue(item);
    this.getLatLong(item);
  }

  getLatLong(item: any) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': item }, (results: any, status: any) => {
      this.latitude = results[0].geometry.location.lat();
      this.longitude = results[0].geometry.location.lng();
    });
  }

  clearParkingDirections(textarea: any) {
    this.bookNow1.get('parking_directions')?.setValue('');
  }

}
