import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { NavController, IonInput } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { AutofillService } from 'src/app/services/autofill.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, AfterViewInit {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  @ViewChild('loginFormRef') loginFormRef!: ElementRef;

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
    private navCtrl: NavController,
    private autofillService: AutofillService
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

  ngAfterViewInit() {
    // Setup autofill functionality after view is initialized
    setTimeout(() => {
      this.setupAutofill();
    }, 500);
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

  /**
   * Setup autofill functionality for native password managers
   */
  private async setupAutofill() {
    try {
      const emailElement = await this.emailInput.getInputElement();
      const passwordElement = await this.passwordInput.getInputElement();

      if (emailElement && passwordElement) {
        this.autofillService.prepareFormForAutofill(emailElement, passwordElement);
        console.log('Autofill setup completed');
      }
    } catch (error) {
      console.error('Error setting up autofill:', error);
    }
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
        console.log("login detail", res);
        this.storageService.saveToStorage('deeplyCalm:user', res.data.user);
        // this.commonService.presentToast('Login Successfully !!', 'success');
        this.getHelperText(res.data.user);

        // Handle native password saving
        await this.handlePasswordSaving(data);

        if (this.remember_me) {
          data.remember_me = this.remember_me;
          this.storageService.saveToStorage('remember_me', data);
        } else {
          this.storageService.removeFromStorage('remember_me');
        }

        // Reset form after handling password saving
        this.loginForm.reset();
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

  /**
   * Handle native password saving after successful login
   * @param data - Login form data
   */
  private async handlePasswordSaving(data: any) {
    try {
      // Only trigger native password saving on native platforms
      if (this.autofillService.isAutofillSupported()) {
        console.log('Triggering native password save for:', data.email);

        // Wait a brief moment to ensure the form submission is processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Trigger native password save
        await this.autofillService.triggerPasswordSave(data.email, data.password);

        // The native WebView will automatically prompt the user to save the password
        // This works because:
        // 1. The form has proper autocomplete attributes
        // 2. The form was submitted successfully
        // 3. The WebView detects this as a login form

        console.log('Native password save triggered successfully');
      } else {
        console.log('Native autofill not supported on this platform');
      }
    } catch (error) {
      console.error('Error handling password saving:', error);
    }
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
