import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  forgotPassword!: FormGroup;
  is_error: boolean = true;
  msg = "Please enter the email address associated with your account.";
  validation_messages = {
    email: [
      { type: "required", message: "Email is required." },
      { type: "pattern", message: "Enter a valid email." }
    ]
  };
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private router: Router
  ) {
    this.forgotPassword = new FormGroup({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')
      ])),
    })
  }

  ngOnInit() {
  }

  sendOtp(form: any) {
    console.log('form>>>>>', form);
    this.commonService.showLoader();
    this.apiService.sendData('forgot-password', form).subscribe({
      next: (resp: any) => {
        this.commonService.dismissLoading();
        if (resp.status == 'success') {
          this.msg = "Please enter the email address associated with your account."
          this.is_error = true;
          let navData: NavigationExtras = {
            queryParams: {
              email: resp.data.email,
              verification_code: resp.data.verification_code
            }
          }
          this.router.navigate(['/correct-email'], navData);
          this.forgotPassword.reset();
        }
      }, error: (err: any) => {
        this.commonService.dismissLoading();
        this.is_error = false;
        this.msg = err.error.message;
        this.forgotPassword.reset();
      }
    })
  }

}
