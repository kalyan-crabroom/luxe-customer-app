import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { SavePassword } from 'capacitor-ios-autofill-save-password';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  passwordIcon: string = 'eye-off';
  passwordType: string = 'password';
  remember_me: boolean = false;
  remember: any;
  deviceInfo: any;
  device_token: any
  device_info: any
  validation_messages = {
    email: [
      { type: "required", message: "Email is required." },
      { type: "pattern", message: "Enter a valid email." }
    ],
    password: [
      { type: "required", message: "Password is required." },
    ],
  };
  constructor(
    private cdref: ChangeDetectorRef,
    private storageService: StorageService,
    private commonService: CommonService,
    private apiService: ApiService,
    private navCtrl: NavController
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl("", Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
      ])),
    });
  }

  ngOnInit() {
    // this.getDeviceInfo();
    // this.requestPushNotificationsPermission()
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('remember_me').then((remember: any) => {
      if (remember) {
        this.remember = remember;
        if (this.remember && this.remember.remember_me) {
          this.remember_me = true;
          this.loginForm.patchValue(this.remember);
        }
      }
    });
  }

  hideShowPassword() {
    this.passwordIcon = (this.passwordIcon === 'eye') ? 'eye-off' : 'eye';
    this.passwordType = (this.passwordIcon === 'eye') ? 'text' : 'password';
    this.cdref.detectChanges();
  }

  async onSubmit(data: any) {
    await this.commonService.showLoader();
    data.user_role = '3';
    this.apiService.doLogin(data).subscribe({
      next: async (res: any) => {
        await this.commonService.dismissLoading();
        // if (Capacitor.getPlatform() != 'web') {
        this.commonService.save_device_details(res.data.user.token);
        console.log('devToken');
        // }
        this.loginForm.reset();
        console.log("login detail", res);
        this.storageService.saveToStorage('deeplyCalm:user', res.data.user);
        // this.commonService.presentToast('Login Successfully !!', 'success');
        this.getHelperText(res.data.user);

        // Save credentials for iOS autofill
        if (Capacitor.getPlatform() === 'ios') {
          try {
            await SavePassword.promptDialog({
              username: data.email,
              password: data.password
            });
          } catch (error) {
            console.log('Error saving password:', error);
          }
        }

        if (this.remember_me) {
          data.remember_me = this.remember_me;

          this.storageService.saveToStorage('remember_me', data);
        } else {
          this.storageService.removeFromStorage('remember_me');
        }
        this.navCtrl.navigateRoot(['/tabs/home']);
        this.storageService.removeFromStorage('bookingData');
      }, error: (err: any) => {

        this.commonService.dismissLoading();
        if (err.error.message) {
          this.commonService.presentAlert(err.error.message);
        } else {
          this.commonService.presentAlert("Something went wrong, Please try again");
        }
      }
    })
  }

  getHelperText(logUser: any) {
    this.apiService.fetchData(`get-help-text`, logUser.token).subscribe((res: any) => {
      this.storageService.saveToStorage('luxe-customer-help-text', res.data);
      this.commonService.helptext = res.data;
      console.log("helptext :", this.commonService.helptext);
    }, (err: any) => {
      console.log("getHelperText api error :", err);
    });
  }
}