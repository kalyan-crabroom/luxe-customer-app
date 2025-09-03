import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { InAppBrowser } from '@capgo/inappbrowser';
import { AlertController, NavController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

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
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl("", Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      user_role: new FormControl("2"),
    });
  }

  ngOnInit() {
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
    data.user_role = "2";
    console.log(data);
    await this.commonService.showLoader();
    this.apiService.doLogin(data).subscribe({
      next: async (res: any) => {
        console.log("login response", res);
        await this.commonService.dismissLoading();
        // if (Capacitor.getPlatform() != 'web') {
        this.commonService.save_device_details(res.data.user.token);
        // }
        this.loginForm.reset();
        this.storageService.saveToStorage('deeplyCalm:therapist', res.data.user);
        // this.commonService.presentToast('Login Successfully!', 'success');

        this.getHelperText(res.data.user);
        if (this.remember_me) {
          data.remember_me = this.remember_me;
          this.storageService.saveToStorage('remember_me', data);
        } else {
          this.storageService.removeFromStorage('remember_me');
        }
        if (res.data.tutorials && res.data.tutorials.length > 0) {
          this.navCtrl.navigateRoot(['/first-time-user-tutorial']);
        } else {
          this.navCtrl.navigateRoot(['/tabs/home']);
        }
      }, error: async (err: any) => {
        console.log("err :", err);
        this.commonService.dismissLoading();
        if (err.error.message) {
          if (err.error.therapist_signUp_status == 'incomplete') {
            this.presentAlert(err.error.message, err.error.user_id);
          } else if (err.error.error_type == 'not_exist' || err.error.error_type == 'invalid_credential') {
            this.commonService.presentAlert(err.error.message);
          } else {
            let alert = await this.alertCtrl.create({
              header: 'Alert',
              subHeader: "You're Application's in Good Hands!",
              message: err.error.message,
              buttons: [{
                text: 'Close',
                handler: () => {
                  console.log('cancel');
                }
              }, {
                text: 'OK',
                handler: () => {
                  console.log('ok');
                }
              }
              ]
            });
            await alert.present();
          }
        } else {
          this.commonService.presentAlert("Something went wrong, Please try again");
        }
      }
    });
  }

  async presentAlert(msg: any, userId: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: 'Alert',
        message: msg,
        buttons: [{
          text: 'Close',
          handler: () => {
            resolve(true);
          }
        }, {
          text: 'OK',
          handler: () => {
            // let body = {
            //   email: this.loginForm.value.email,
            //   password: this.loginForm.value.password,
            //   id: userId
            // }
            // this.router.navigate(['/background-check/' + JSON.stringify(body)]);

            let body = {
              email: this.loginForm.value.email,
              password: this.loginForm.value.password,
              id: userId
            }
            this.router.navigate(['/background-check'], { state: { user_detail: body } });
            resolve(true);
          }
        }
        ]
      });
      await alert.present();
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
