import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {
  contactForm : FormGroup
  logUser : any
  validation_messages = {
    email : [
      {type:'required', message:"Email is required."},
      {type:'pattern', message : "Enter a valid email."}
    ],
    phone_no: [
      { type: "required", message: "Phone number is required." },
      { type: 'minlength', message: "Minimum 10-12 digits are allowed" },
      { type: 'maxlength', message: "Maximum 12 digits are allowed" },
    ],
    content:[
      {type:'required', message:'Please Enter Message.'}
    ]
  }
 
  constructor(
    private apiService : ApiService,
    private storageService : StorageService,
    private commonService : CommonService,
    private router : Router
  ) {
    this.contactForm = new FormGroup({
      email: new FormControl("", Validators.compose([Validators.required,  Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')])),
      phone_no: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(12)
      ])),
      content: new FormControl('', Validators.compose([Validators.required]))
    })
   }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((User:any)=>{
      if(User != null){
        this.logUser = User;
        console.log('logUser',this.logUser);
        this.contactForm.controls['email'].setValue(this.logUser?.email);
          
      }
    })
  }

  onSubmit(form:any){
    console.log('form',form);
    form.token = this.logUser.token;
    this.commonService.showLoader();
    this.apiService.send('contact_us',form).subscribe({
      next:(resp:any)=>{
        console.log('res',resp);
        this.commonService.dismissLoading();
        this.router.navigateByUrl('/tabs/home');
        this.commonService.presentAlert(resp.message);
      },
      error:(err:any)=>{
        console.log('err',err);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message)
      }
    })
  } 

}
