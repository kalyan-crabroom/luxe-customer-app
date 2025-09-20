import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.page.html',
  styleUrls: ['./add-location.page.scss'],
})
export class AddLocationPage implements OnInit {

  addNewLocation!: FormGroup;
  logUser: any;
  currentLocation: any;

  validation_messages = {
    location_address: [
      { type: 'required', message: "This Field is required." },
      { type: "invalidStreetAddress", message: "Please enter a complete street address with street number and street name." },
      { type: "cityNotAllowed", message: "City names are not allowed. Please enter a complete street address." }
    ]
  };

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

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private storageService: StorageService,
    private commonService: CommonService,
    private router: Router
  ) {

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });

    this.addNewLocation = this.fb.group({
      token: [''],
      location_name: ['', Validators.required],
      location_address: ['', [Validators.required, AddLocationPage.streetAddressValidator]],
      location_type: [''],
      parking_directions: ['', Validators.required],
      table: ['', Validators.required],
      sheet: ['', Validators.required],
      stair: ['', Validators.required],
      pet: ['', Validators.required],
      loc_lat: [''],
      loc_long: ['']
    });
  }

  ngOnInit() {
    this.getLocation();
  }

  getLocation() {
    this.apiService.getLocation().subscribe((res: any) => {
      this.currentLocation = res;
    })
  }

  async onSubmit() {
    if (!this.addNewLocation.valid) {
      return;
    }
    var location = this.currentLocation.loc.split(",");
    this.addNewLocation.patchValue({
      token: this.logUser.token,
      loc_lat: location[0],
      loc_long: location[1]
    });
    await this.commonService.showLoader();
    this.apiService.send("add-location", this.addNewLocation.value).subscribe({
      next: async (res: any) => {
        await this.commonService.dismissLoading();

        this.router.navigate(['/tabs/myaccount']);
        this.commonService.presentAlert(res.message);

      }, error: (err: any) => {
        console.log('err', err);
        this.commonService.dismissLoading();
      }
    });
  }

}
