import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-guest-details2',
  templateUrl: './guest-details2.page.html',
  styleUrls: ['./guest-details2.page.scss'],
})
export class GuestDetails2Page implements OnInit {
  receivedData: any;
  selectedLocation: any;
  logUser: any
  locationData: any = []
  ready: boolean = false;
  isEdit: boolean = false;
  therapist_id: any
  discount: number = 0;
  product_id: any
  helptext: any;
  bookingData: any = {};
  constructor(
    private router: Router,
    private storageService: StorageService,
    private apiService: ApiService,
    private alertCtrl: AlertController,
    private commonService: CommonService,
  ) {
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'choose_location');
    }
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getLocations();
      }
    });

    this.storageService.getFromStorage('bookingData').then((data: any) => {
      if (data) {
        this.bookingData = data;
        if (this.bookingData.selectedLocation) {
          this.selectedLocation = this.bookingData.selectedLocation.id;
        }
      }
    });
  }

  ngOnInit() {

  }

  getLocations() {
    this.ready = false;
    this.apiService.fetchData(`LocationListByUser`, this.logUser.token).subscribe((res: any) => {
      this.ready = true;
      this.locationData = res.data.data || [];
      if (this.bookingData?.selectedLocation?.id) {
        this.selectedLocation = String(this.bookingData.selectedLocation.id);
      }
    }, (err: any) => {
      this.ready = true;
      this.commonService.presentAlert(err.error.message);
    });
  }

  deleteLocations(index: number, locationId: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: "Delete !",
        message: "Are you sure ?",
        buttons: [
          {
            text: 'No',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              const payload = {
                location_id: locationId,
                token: this.logUser.token
              }
              this.commonService.showLoader();
              this.apiService.send('deleteLocationById', payload).subscribe((res: any) => {
                this.commonService.dismissLoading();
                if (res) {
                  this.locationData.splice(index, 1);
                  this.commonService.presentToast(res.message, "success");
                } else {
                  this.commonService.presentToast(res.message, "danger");
                }
              }, (err: any) => {
                this.commonService.dismissLoading();
                if (err?.error?.message) {
                  this.commonService.presentAlert(err?.error?.message);
                } else {
                  this.commonService.presentAlert("Something went wrong, Please try again");
                }
              });
            }
          }
        ]
      });
      await alert.present();
    })
  }

  locationUpdate(index: number, locationId: any) {
    const parameter: NavigationExtras = {
      queryParams: {
        locationId: locationId,
        isEdit: true,
        page: 'guest-details2'
      }
    };
    this.router.navigate(['/book-now1'], parameter);
  }

  addNewLocation() {
    const parameter: NavigationExtras = {
      queryParams: {
        addNewLoc: true,
        page: 'guest-details2'
      }
    };
    this.router.navigate(['/book-now1'], parameter);
  }

  async goToNextPage() {
    let selectedLocation = this.locationData.find((res: any) => res.id == this.selectedLocation);
    this.checkZipcode(selectedLocation);
    // this.bookingData.selectedLocation = selectedLocation;
    // console.log("this.bookingData.selectedLocation :", this.bookingData.selectedLocation);
    // await this.storageService.saveToStorage('bookingData', this.bookingData);
    // // this.router.navigate(['/preferences']);
    // this.router.navigate(['/book-now2']);

  }

  goBack() {
    this.router.navigate(['/guest-details']);
  }

  async checkZipcode(selectedLocation: any) {
    await this.commonService.showLoader("Please wait...");
    let payload: any = {
      token: this.logUser.token,
      lat: selectedLocation.loc_lat,
      long: selectedLocation.loc_long
    }
    this.apiService.send('check-zipcode', payload).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.bookingData.selectedLocation = selectedLocation;
      console.log("selectedLocation :", this.bookingData.selectedLocation);
      await this.storageService.saveToStorage('bookingData', this.bookingData);
      // this.router.navigate(['/preferences']);
      this.router.navigate(['/book-now2']);
    }, async (err) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
      console.log("err :", err);
    });
  }

}

