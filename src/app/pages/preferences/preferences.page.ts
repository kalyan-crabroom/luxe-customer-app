import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})
export class PreferencesPage implements OnInit {
  preferences: FormGroup;
  data: any;
  logUser: any = [];
  therapist_id: any;
  user_id: any;
  isModalOpen: boolean = false;
  responseMessage: any
  showButton: boolean = false
  preferencesData: any = []
  showButton1: any
  validation_messages = {
    therapistgender: [
      { type: 'required', message: "This Field is required." },
    ],
    pressurelevel: [
      { type: 'required', message: "This Field is required." },
    ],
    communicationlevel: [
      { type: 'required', message: "This Field is required." },
    ]
  };
  helptext: any;
  bookingData: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storageService: StorageService,
    private commonService: CommonService,
    private cd: ChangeDetectorRef,
    private navCtrl: NavController
  ) {
    this.preferences = new FormGroup({
      // therapistgender: new FormControl("", Validators.required),
      pressurelevel: new FormControl("", Validators.required),
      music: new FormControl("false", Validators.required),
      communicationlevel: new FormControl("", Validators.required),
    });
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'preferences');
    }
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('bookingData').then((data: any) => {
      if (data) {
        this.bookingData = data;
        console.log("bookingData :", this.bookingData);
        if (this.bookingData.preferences) {
          this.preferences.patchValue(this.bookingData.preferences);
        }
        this.showButton = true;
      }
    });

    this.route.queryParams.subscribe((params: any) => {
      console.log("params :",params);
      try {
        // if (params.formData) {
        //   this.data = params.formData ? JSON.parse(params.formData) : {};
        //   this.showButton1 =  params.formData ? JSON.parse(params.formData) : {};
        //   console.log('data2', this.data);
        // } else 
        if (params.data) {
          this.data = params.data ? JSON.parse(params.data) : {};
          this.user_id = this.data.token;
        }

        if (!this.user_id) {
          this.storageService.getFromStorage('deeplyCalm:user').then((User: any) => {
            console.log("User :",User);
            if (User != null) {
              this.logUser = User;
              if (!this.bookingData.preferences) {
                this.getPreferences();
              }
            }
          });
        }
      } catch (error) {
        console.error('Error parsing query parameters', error);
      }
    });
  }

  async getPreferences() {
    await this.commonService.showLoader();
    this.apiService.fetchData(`get-preferences`, this.logUser.token).subscribe({
      next: async (res: any) => {
        if (res && res.preferences) {
          this.preferencesData = res.preferences;
          console.log('preferencesData', this.preferencesData);
          this.preferences.patchValue({
            pressurelevel: res.preferences.pressurelevel,
            music: res.preferences.music === 'on',
            communicationlevel: res.preferences.communicationlevel
          });
          this.showButton = true;
        } else {
          this.showButton = false;
        }
        await this.commonService.dismissLoading();
      },
      error: async (err: any) => {
        await this.commonService.dismissLoading();
        this.showButton = false;
      }
    });
  }

  async onSubmit(formdata: any) {
    formdata.music = this.preferences.get('music')?.value ? 'on' : 'off';
    if (this.user_id) {
      formdata.token = this.user_id;
      await this.commonService.showLoader();
      this.apiService.send('add-preferences', formdata).subscribe({
        next: async (resp: any) => {
          await this.commonService.dismissLoading();
          this.responseMessage = this.data.message
          this.isModalOpen = true;
        },
        error: async (err: any) => {
          await this.commonService.dismissLoading();
        }
      });
    } else if (this.logUser.token) {
      formdata.token = this.logUser.token;
      if (!this.bookingData) {
        if (formdata) {
          await this.commonService.showLoader();
          this.apiService.send('add-preferences', formdata).subscribe({
            next: async (resp: any) => {
              await this.commonService.dismissLoading();
              this.router.navigate(['/tabs/home']);
            },
            error: async (err: any) => {
              await this.commonService.dismissLoading();
            }
          });
        }
      } else {
        console.log("bookingData :", this.bookingData);
        this.bookingData.preferences = formdata;
        await this.storageService.saveToStorage('bookingData', this.bookingData);
        this.router.navigate(['/book-now2']);
      }
    }
  }

  async doLogin(data: any) {
    console.log('data11', data);
    await this.commonService.showLoader();
    this.apiService.doLogin(data).subscribe({
      next: async (res: any) => {
        await this.commonService.dismissLoading();
        // if (Capacitor.getPlatform() != 'web') {
        this.commonService.save_device_details(res.data.user.token);
        // }
        this.isModalOpen = false;
        this.cd.detectChanges();
        const updatedUserData = { ...res.data.user, zip_code: this.data.zip_code };
        this.storageService.saveToStorage('deeplyCalm:user', updatedUserData);
        this.commonService.save_device_details(res.data.user.token);
        // this.commonService.presentToast('Login Successfully', 'success');
        this.navCtrl.navigateRoot(['/first-time-user-tutorial']);
      }, error: (err: any) => {
        this.commonService.dismissLoading();
        if (err.error.message) {
          this.commonService.presentAlert(err.error.message);
          console.log('errormsg');

        } else {
          this.commonService.presentAlert("Something went wrong, Please try again");
        }
      }
    });
  }

  async goToLogin() {
    const data = this.data;
    const loginData = {
      email: data.email,
      password: data.password,
      user_role: '3'
    };
    await this.doLogin(loginData);
  }

}
