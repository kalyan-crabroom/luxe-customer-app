import { Token } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  edit_password: FormGroup
  oldPasswordType: string = 'password';
  newPasswordType: string = 'password';
  confirmPasswordType: string = 'password';
  oldPasswordIcon: string = 'eye-off';
  newPasswordIcon: string = 'eye-off';
  confirmPasswordIcon: string = 'eye-off';
  logUser: any = []
  validation_messages = {
    current_password: [
      { type: 'required', message: 'Enter Old Password.' }
    ],
    new_password: [
      { type: "required", message: "Password is required." },
      { type: 'minlength', message: "Password must be at least 6 characters." },
    ],
    confirm_password: [
      { type: "required", message: "Confirm password is required." }
    ],
  }
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.edit_password = new FormGroup({
      current_password: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      new_password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6),
      ])),
      confirm_password: new FormControl('', Validators.compose([
        Validators.required,
      ]))
    },
      {
        validators: [this.functionPassword]
      },
    );
  }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        console.log('logUser', this.logUser);

      }
    });
  }

  functionPassword(fg: AbstractControl) {
    const p = fg.get('new_password')?.value
    const cp = fg.get('confirm_password')?.value
    return p === cp ? null : { passwordNotMatch: true }
  }

  hideShowPassword(field: string) {
    switch (field) {
      case 'old':
        this.oldPasswordIcon = (this.oldPasswordIcon === 'eye-outline') ? 'eye-off-outline' : 'eye-outline';
        this.oldPasswordType = (this.oldPasswordIcon === 'eye-outline') ? 'text' : 'password';
        break;
      case 'new':
        this.newPasswordIcon = (this.newPasswordIcon === 'eye-outline') ? 'eye-off-outline' : 'eye-outline';
        this.newPasswordType = (this.newPasswordIcon === 'eye-outline') ? 'text' : 'password';
        break;
      case 'confirm':
        this.confirmPasswordIcon = (this.confirmPasswordIcon === 'eye-outline') ? 'eye-off-outline' : 'eye-outline';
        this.confirmPasswordType = (this.confirmPasswordIcon === 'eye-outline') ? 'text' : 'password';
        break;
      default:
        break;
    }
  }

  onSubmit(form: any) {
    console.log('form', form);
    let payload = {
      token: this.logUser.token,
      current_password: form.current_password,
      new_password: form.new_password
    }
    console.log('payload', payload);
    this.commonService.showLoader();
    this.apiService.send('change-password', payload).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        console.log('res', res);
        this.router.navigate(['/tabs/myaccount']);
        this.commonService.presentAlert(res.message);
      },
      error: (err: any) => {
        this.commonService.dismissLoading();
        console.log('err', err);
        this.commonService.presentAlert(err.error.message);
      }
    })
  }
}
