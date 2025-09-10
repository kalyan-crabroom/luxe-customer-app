import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { StorageService } from '../services/storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  logUser: any = []
  therapistList: any = []
  ready: boolean = false;
  locationData: any = []
  user_profile: any = []
  userData: any = []
  bookingHistory: any = []
  favTherapistDetails: any = []
  constructor(
    private storageService: StorageService,
    private cdref: ChangeDetectorRef,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private navCtrl : NavController
  ) {

  }

  ionViewWillEnter() {
    this.apiService.location_refresh.subscribe((res: any) => {
      if (res) {
        this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
          this.logUser = user;
          this.getLocations();
          this.getAllDetails();
          this.getFavTherapist();
        });
      }
    });
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      this.logUser = user;
      this.user_profile = user.user_meta
      this.cdref.detectChanges();
      this.getLocations();
      this.getAllDetails();
      this.getFavTherapist()
    });

    this.storageService.refresh_storage.subscribe((data: any) => {
      if (data) {
        this.storageService.getFromStorage('deeplyCalm:user').then((userD: any) => {
          this.logUser = userD
          this.user_profile = userD.user_meta
          this.getAllDetails()
        })
      }
    });
  }

  chat(id: any) {
    this.router.navigate(['/message-details/' + id])
  }


  getFavTherapist() {
    this.ready = false;
    this.apiService.fetchData(`get-favorite-therapist`, this.logUser.token).subscribe(
      (res: any) => {
        this.ready = true;
        if (res.data && Array.isArray(res.data)) {
          this.favTherapistDetails = res.data.map((item: any) => item.therapist_details);
        }
      },
      (err: any) => {
        this.ready = true;
        this.commonService.presentAlert(err.error.message);
      }
    );
  }

  getAllDetails() {
    this.ready = false;
    this.apiService.fetchData(`customerProfile`, this.logUser.token).subscribe((res: any) => {
      this.ready = true;
      this.userData = res.data;
      this.bookingHistory = res.data.bookings;
    }, (err: any) => {
      this.ready = true;
    })
  }

  getAllTherapist() {
    this.apiService.fetchData("get-alltherapist", this.logUser.token).subscribe({
      next: (res: any) => {
        this.therapistList = res;
        console.log('this.therapist', this.therapistList);

      },
      error: (err: any) => {
        console.log('errr', err);
      }
    })
  }

  goToTherapist(id: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        therapist_id: id
      }
    };
    this.router.navigate(['/therapist-profile'], parameter);
  }

  getLocations() {
    this.ready = false;
    this.apiService.fetchData(`LocationListByUser`, this.logUser.token).subscribe({
      next: (res: any) => {
        this.ready = true;
        console.log('resp>>>>', res);
        this.locationData = res.data.data || [];
      },
      error: (err: any) => {
        this.ready = true;
        if (err?.error?.message) {
          this.commonService.presentAlert(err?.error?.message);
        } else {
          this.commonService.presentAlert("Something went wrong, Please try again");
        }
        if (err.error.error_code == 'token_expired') {
          this.storageService.removeFromStorage('deeplyCalm:user');
          this.navCtrl.navigateRoot(['/login']);
        }
      }
    })
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
              console.log('yes');
              this.locationDelete(index, locationId)
            }
          }
        ]
      });
      await alert.present();
    })
  }

  locationDelete(index: any, locationId: any) {
    const payload = {
      location_id: locationId,
      token: this.logUser.token
    }
    this.commonService.showLoader();
    this.apiService.send('deleteLocationById', payload).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        if (res) {
          this.locationData.splice(index, 1);
          this.commonService.presentToast(res.message, "success");
        } else {
          this.commonService.presentToast(res.message, "danger");
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
    })
  }

  locationUpdate(index: number, locationId: any) {
    const parameter: NavigationExtras = {
      queryParams: {
        locationId: locationId,
        isEdit: true,
        page: 'tabs/myaccount'
      }
    };
    this.router.navigate(['/book-now1'], parameter);
  }

  goToNext(id: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

}
