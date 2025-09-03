import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
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
  responseMessage: string = ''
  signup_data: any = []
  remember_me: boolean = false;
  remember: any;
  terms_checked: boolean = false;

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
    ]
  };

  isModalEmail: boolean = false;

  emailForm = new FormGroup({
    otp: new FormControl("", Validators.required),
  });
  emailVerificationRes: any;
  signupFormData: any;

  constructor(
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private commonService: CommonService,
    private storageService: StorageService,
    private navCtrl: NavController,
    private router: Router
  ) {
    this.signUp = new FormGroup({
      //role: new FormControl('therapist'),
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

    }, {
      validators: [this.functionPassword]
    })

  }

  functionPassword(fg: AbstractControl) {
    const p = fg.get('password')?.value
    const cp = fg.get('confirm_password')?.value
    return p === cp ? null : { passwordNotMatch: true }
  }

  ngOnInit() {
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
    if (!this.signUp.valid) {
      return;
    }

    this.signupFormData = data;
    await this.commonService.showLoader();
    this.apiService.send('send_email', { email: this.signupFormData.email }).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.emailVerificationRes = res;
      this.isModalEmail = true;
      this.cd.detectChanges();
    }, async (err) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
      console.log("Err :", err);
    });

  }

  async doSignup(data: any) {
    await this.commonService.showLoader();
    this.apiService.sendData('signUpTherapist', data).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        this.responseMessage = res.message;
        let body = {
          email: this.signUp.value.email,
          first_name: this.signUp.value.first_name,
          last_name: this.signUp.value.last_name,
          password: this.signUp.value.password,
          id: res.data.user.id
        }
        // this.router.navigate(['/background-check'], { state: { user_detail: body } });

        this.router.navigate(['/onboard'], { state: { user_detail: body } });
      }, error: (error: any) => {
        this.commonService.dismissLoading();
        if (error.error.errors?.message) {
          this.commonService.presentAlert(error.error.errors.message[0]);
        } else {
          this.commonService.presentAlert("Something went wrong, Please try again");
        }
      }
    });
  }

  // async goToLogin() {
  //   const data = this.signUp.value;
  //   const loginData = {
  //     email: data.email,
  //     password: data.password
  //   };
  //   await this.doLogin(loginData);
  // }

  // async doLogin(data: any) {
  //   await this.commonService.showLoader();
  //   this.apiService.doLogin(data).subscribe({
  //     next: async (res: any) => {
  //       await this.commonService.dismissLoading();
  //       this.isModalOpen = false;
  //       this.cd.detectChanges();
  //       this.storageService.saveToStorage('deeplyCalm:therapist', res.data.user);
  //       this.commonService.presentToast('Login Successfully', 'success');
  //       this.navCtrl.navigateRoot(['/first-time-user-tutorial']);
  //     }, error: (err: any) => {
  //       this.commonService.dismissLoading();
  //       if (err.error.message) {
  //         this.commonService.presentAlert(err.error.message);
  //       } else {
  //         this.commonService.presentAlert("Something went wrong, Please try again");
  //       }
  //     }
  //   });
  // }

  emailModal(is_open: boolean) {
    this.isModalEmail = is_open;
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

    // console.log("formdata:", formdata);
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
}
