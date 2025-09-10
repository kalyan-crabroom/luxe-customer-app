import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-correct-email',
  templateUrl: './correct-email.page.html',
  styleUrls: ['./correct-email.page.scss'],
})
export class CorrectEmailPage implements OnInit {
  codeForm: FormGroup;
  email: any;
  verification_code: any;
  is_error: boolean = true;
  msg = "Success! Please enter the code that was sent to the email associated with your account.";
  validation_messages = {
    verification_code: [
      { type: "required", message: "Please Enter Otp." }
    ]
  };
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private commonService: CommonService,
    private router: Router
  ) {

    this.route.queryParams.subscribe((param: any) => {
      console.log('param', param);
      if (param.email) {
        this.email = param.email;
        this.verification_code = param.verification_code;
      }
    });
    this.codeForm = new FormGroup({
      verification_code: new FormControl('', Validators.compose([Validators.required]))
    });
  }

  ngOnInit() {
  }


  onSubmit(formValue: any) {
    formValue.email = this.email;
    formValue.otp = formValue.verification_code;

    // console.log('matched', formValue.verification_code, this.verification_code);

    this.commonService.showLoader();
    this.apiService.sendData('verify-otp-password-reset', formValue).subscribe((res: any) => {
      this.commonService.dismissLoading();

      this.msg = "Success! Please enter the code that was sent to the email associated with your account.";
      this.is_error = true;
      this.codeForm.reset();
      let navData: NavigationExtras = {
        queryParams: {
          email: this.email,
          verification_code: this.verification_code
        }
      };
      this.router.navigate(['/reset-password'], navData);

    }, (err) => {
      console.log("error :", err.error);
      this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });

    // if (formValue.verification_code == this.verification_code) {
    //   this.msg = "Success! Please enter the code that was sent to the email associated with your account.";
    //   this.is_error = true;
    //   this.codeForm.reset();
    //   let navData: NavigationExtras = {
    //     queryParams: {
    //       email: this.email,
    //       verification_code: this.verification_code
    //     }
    //   };
    //   this.router.navigate(['/reset-password'], navData);
    // } else {
    //   this.is_error = false;
    //   this.codeForm.reset();
    //   this.msg = "The code you entered was not correct, please try again.";
    // }

  }

  sendAgain() {
    this.commonService.showLoader();
    this.apiService.sendData('forgot-password', { email: this.email }).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.commonService.dismissLoading();
        if (res.status === 'success') {
          this.verification_code = res.data.verification_code;
          this.codeForm.reset();
          this.commonService.presentAlert(res.message);
        }
      },
      error: (err: any) => {
        console.log(err.error);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    });
  }

}
