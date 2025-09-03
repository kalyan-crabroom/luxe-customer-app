import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  resetForm: FormGroup;
  passwordType1: string = "password";
  passwordType2: string = "password";
  passwordIcon1: string = "eye-off";
  passwordIcon2: string = "eye-off";
  email : any;
  msg : any
  isModalOpen: boolean = false;
  validation_messages = {
    password: [
      { type: "required", message: "Please Enter Password." },
      {
        type: "minlength", message: "Password must be at least 6 characters."
      }
    ],
    confirmPassword: [
      { type: "required", message: "Please Enter Confirm Password." },
    ],
  };

  constructor(
    private commonService :CommonService,
    private apiService : ApiService,
    private route : ActivatedRoute,
    private router : Router,
    private cdref : ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe((param: any) => {
      console.log(param);
      if (param.email) {
        this.email = param.email; 
      }
    });
    this.resetForm = new FormGroup({
      password: new FormControl('', [Validators.minLength(6), Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, {
      validators: [this.functionPassword]
    });
  }

  functionPassword(fg: AbstractControl) {
    const p = fg.get('password')?.value
    const cp = fg.get('confirmPassword')?.value
    return p === cp ? null : { passwordNotMatch: true }
  }

  ngOnInit() {
  }


  onSubmit(formValue: any) {
    this.commonService.showLoader();
    formValue.email = this.email;    
    this.apiService.sendData('update-password', formValue).subscribe({
      next: (res: any) => {
        console.log('res',res);
        
        this.commonService.dismissLoading();
        if (res.status == 'success') {
          this.msg = res.message;
          this.isModalOpen = true;
          
        }
      }, error: (err: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    });
  }

  hideShowPass1() {
    this.passwordType1 = this.passwordType1 === "text" ? "password" : "text";
    this.passwordIcon1 = this.passwordType1 === "text" ? "eye" : "eye-off";
  }

  hideShowPass2() {
    this.passwordType2 = this.passwordType2 === "text" ? "password" : "text";
    this.passwordIcon2 = this.passwordType2 === "text" ? "eye" : "eye-off";
  }

  goToLogin(){
    this.isModalOpen = false;
    this.cdref.detectChanges();
    this.router.navigate(['/login']);
  }

}
