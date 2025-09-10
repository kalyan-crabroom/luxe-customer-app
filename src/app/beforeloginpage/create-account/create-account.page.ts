import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {
  signUp!: FormGroup;
  passwordType: string = 'password';
  passwordtype: string = 'password';
  passwordIcon: string = 'eye-off';
  passwordicon: string = 'eye-off';
  isModalOpen: boolean = false;
  isModalOpen2: boolean = false;
  responseMessage: string = ''
  signup_data: any = []
  remember_me: boolean = false;
  remember: any;
  matchZipCode: any
  signupRes: any
  zipcode_value: any
  validation_messages = {
    first_name: [
      { type: "required", message: "First name is required." }
    ],
    last_name: [
      { type: "required", message: "Last name is required." },
    ],
    zip_code: [
      { type: "required", message: "Zip code is required." },
      { type: 'minlength', message: "Minimum 5 digits are allowed" },
      { type: 'maxlength', message: "maximum 6 digits are allowed" },
    ],
    email: [
      { type: "required", message: "Email is required." },
      { type: "pattern", message: "Please enter a valid email address." }
    ],
    password: [
      { type: "required", message: "Password is required." },
      { type: 'minlength', message: "Password must be at least 6 characters." },
    ],
    confirm_password: [
      { type: "required", message: "Confirm password is required." }
    ],
    otp: [
      { type: "required", message: "OTP is required." }
    ],
    phone: [
      { type: "pattern", message: "Phone number must contain exactly 10 digits and only numbers." }
    ],
    timezone: [
      { type: "required", message: "Timezone is required." }
    ]
  };
  isModalEmail: boolean = false;

  emailForm = new FormGroup({
    otp: new FormControl("", Validators.required),
  });
  emailVerificationRes: any;
  signupFormData: any;
  terms_checked: boolean = false;
  terms_non_sexual: boolean = false;
  usaTimezones: any[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private commonService: CommonService,
    private storage: StorageService,
    private navCtrl: NavController,
  ) {
    this.signUp = new FormGroup({
      first_name: new FormControl("", Validators.compose([
        Validators.required,

      ])),
      last_name: new FormControl('', Validators.compose([
        Validators.required
      ])),
      phone: new FormControl('', Validators.pattern('^[0-9]{10}$')),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')
      ])),
      zip_code: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(6)
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6),
      ])),
      confirm_password: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      terms: new FormControl(false, Validators.required),
      term_non_sexual: new FormControl(false, Validators.required),

      // timezone: new FormControl('', Validators.compose([
      //   Validators.required
      // ])),
    }, {
      validators: [this.functionPassword]
    });
  }

  functionPassword(fg: AbstractControl) {
    const p = fg.get('password')?.value
    const cp = fg.get('confirm_password')?.value
    return p === cp ? null : { passwordNotMatch: true }
  }

  ngOnInit() {
      this.usaTimezones = moment.tz.names().filter(name => name.startsWith('America/'));
  }

  hideShowPassword(params: any = '') {
    if ((params == 'confirm')) {
      this.passwordIcon = (this.passwordIcon == 'eye') ? 'eye-off' : 'eye';
      this.passwordType = (this.passwordIcon == 'eye') ? 'text' : 'password';
    } else {
      this.passwordicon = (this.passwordicon == 'eye') ? 'eye-off' : 'eye';
      this.passwordtype = (this.passwordicon == 'eye') ? 'text' : 'password';
    }
    this.cd.detectChanges();
  }

  async onSubmit(data: any) {
    this.signupFormData = data;
    await this.commonService.showLoader();
    this.apiService.send('send_email', { email: this.signupFormData.email }).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.isModalEmail = true;
      this.emailVerificationRes = res;
      this.cd.detectChanges();
    }, async (err) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
      console.log("Err :", err);
    });
  }

  async doSignup(data: any) {
    await this.commonService.showLoader();
    this.apiService.sendData('signUp', data).subscribe({
      next: async (res: any) => {
        await this.commonService.dismissLoading();
        this.signupRes = res;
        this.matchZipCode = res.zipcoderesponse.status;
        this.responseMessage = this.signupRes.message;
        if (this.matchZipCode) {
          // let parameter: NavigationExtras = {
          //   queryParams: {
          //     data: JSON.stringify({ ...this.signupRes, ...this.signUp.value })
          //   }
          // };
          // this.navCtrl.navigateForward(['/preferences'], parameter);
          this.isModalOpen = true;
          this.cd.detectChanges();
        } else {
          this.isModalOpen2 = true;
        }
        console.log("responseMessage :", this.responseMessage);

      }, error: async (error: any) => {
        await this.commonService.dismissLoading();
        this.commonService.presentAlert(error.error.message)
      }
    });
  }

  async goToLogin() {
    const data = this.signUp.value;
    const loginData = {
      email: data.email,
      password: data.password,
      user_role: '3'
    };
    await this.doLogin(loginData);
  }

  async doLogin(data: any) {
    await this.commonService.showLoader();
    this.apiService.doLogin(data).subscribe({
      next: async (res: any) => {
        await this.commonService.dismissLoading();
        // if (Capacitor.getPlatform() != 'web') {
        this.commonService.save_device_details(res.data.user.token);
        // }
        this.isModalOpen = false;
        this.cd.detectChanges();
        const updatedUserData = { ...res.data.user, zip_code: this.signUp.value.zip_code };
        this.storage.saveToStorage('deeplyCalm:user', updatedUserData);
        // this.commonService.presentToast('Login Successfully', 'success');

        this.navCtrl.navigateRoot(['/first-time-user-tutorial']);
        this.updateUserZipCodetimezone(this.signUp.value.zip_code, updatedUserData);

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

  updateUserZipCodetimezone(zipcode: any, updatedUserData: any) {
    this.apiService.getTimezoneByZip(zipcode).subscribe(
      (response: any) => {
        console.log("response :", response);
        let timezone: any;
        if (response && response.timeZoneId) {
          timezone = response.timeZoneId;
        } else {
          timezone = this.apiService.getDeviceTimezone();
        }
        this.apiService.send('updateUserZipCodeTimezone', { timezone: timezone, token: updatedUserData.token }).subscribe((res: any) => {
          console.log("res :", res);
          updatedUserData.user_zipcode_timezone = res.zipcode;
          this.storage.saveToStorage('deeplyCalm:user', updatedUserData);
        }, (err) => {
          console.log("err :", err);
        });

      },
      (error) => {
        console.log("Error fetching timezone");
      }
    );
  }

  async updateLocation() {
    const data = this.signUp.value;
    const payload = {
      zipcode: data.zip_code,
      user_id: this.signupRes.data.id
    };
    this.commonService.showLoader()
    this.apiService.send('createzip', payload).subscribe({
      next: async (res: any) => {
        this.commonService.dismissLoading();
        this.zipcode_value = res.zipcode_availability.status
        console.log(' this.zipcode_value', this.zipcode_value);

        if (this.zipcode_value == true) {
          this.isModalOpen2 = false;
          this.isModalOpen = true;
          this.cd.detectChanges();
          // this.cd.detectChanges();
          // let parameter: NavigationExtras = {
          //   queryParams: {
          //     data: JSON.stringify({ ...this.signupRes, ...this.signUp.value })
          //   }
          // };
          // console.log('parameter', parameter);
          // this.navCtrl.navigateForward(['/preferences'], parameter);
        }
        else if (this.zipcode_value == false) {
          console.log('ismodel');
          this.cd.detectChanges();
          this.isModalOpen = false;
          this.isModalOpen2 = true;
          this.commonService.presentAlert(res.zipcode_availability.msg);
        }
      },
      error: (error: any) => {
        console.error('Error updating location:', error);
        this.commonService.dismissLoading();
        this.commonService.presentAlert("An error occurred while updating the location.");
      }
    });
  }

  async gotoModel() {
    this.isModalOpen2 = false;
    this.isModalOpen = true; //added
    // let parameter: NavigationExtras = {
    //   queryParams: {
    //     data: JSON.stringify({ ...this.signupRes, ...this.signUp.value })
    //   }
    // };
    // this.navCtrl.navigateForward(['/preferences'], parameter);
    this.cd.detectChanges();
  }


  emailModal(is_open: boolean) {
    this.isModalEmail = is_open;
    this.emailForm.reset();
    this.cd.detectChanges();
  }

  submitOtp(formdata: any) {
    this.commonService.showLoader();
    formdata.email = this.signupFormData.email;
    this.apiService.send('verify_otp', formdata).subscribe((res: any) => {
      this.commonService.dismissLoading();
      this.isModalEmail = false;
      this.cd.detectChanges();
      this.doSignup(this.signupFormData);
    }, (err) => {
      console.log("err :", err);
      this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });

    // if (formdata.otp == this.emailVerificationRes.otp) {
    //   this.isModalEmail = false;
    //   this.cd.detectChanges();
    //   this.doSignup(this.signupFormData);
    // } else {
    //   this.commonService.presentAlert("Please enter a valid otp.");
    // }
  }


  async sendAgainOtp() {
    await this.commonService.showLoader();
    this.apiService.send('send_email', { email: this.signupFormData.email }).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.emailVerificationRes = res;
      this.commonService.presentAlert(res.message);
    }, async (err) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
      console.log("Err :", err);
    });
  }

  acceptTermCondition(event: any) {
    this.terms_checked = event.currentTarget.checked;
  }

  acceptTermNonSexual(event: any) {
    this.terms_non_sexual = event.currentTarget.checked;
  }

}
