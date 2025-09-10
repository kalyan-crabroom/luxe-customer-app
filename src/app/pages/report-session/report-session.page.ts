import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-report-session',
  templateUrl: './report-session.page.html',
  styleUrls: ['./report-session.page.scss'],
})
export class ReportSessionPage implements OnInit {
  reportSession : FormGroup
  logUser :any = []
  params : any;
  report_client:boolean = false;
  validation_messages = {
    reason : [
      {type : 'required' , message : 'Reason is required.'}
    ]
  }
  helptext: any;
  constructor(
    private apiService : ApiService,
    private storageService : StorageService,
    private commonService : CommonService,
    private router : Router,
    private activatedRoute: ActivatedRoute,

  ) {
    this.reportSession = new FormGroup({
      reason: new FormControl("", Validators.compose([
        Validators.required,
        
      ]))
    });
    if(this.commonService.helptext.length > 0){
    this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'report_request');
    }
   }

  ngOnInit() {
    // if(this.router.getCurrentNavigation()?.extras.state){
    //   this.params = this.router.getCurrentNavigation()?.extras.state;
    //   console.log('params:>>Report',this.params);
    // }

    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params && params.bookingData) {
        this.params = JSON.parse(params.bookingData);
        console.log('params', this.params);

        this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
          if (user != null) {
            this.logUser = user;
          }
        });
      }
      if (params.report_client) {
        this.report_client = params.report_client;
        console.log("report client 11:",this.report_client);
      }
      console.log("report client 22:",this.report_client);
    });

    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });
  
  }

  async onSubmit(form:any){
    console.log('form',form);
    form.booking_id = this.params.id
    form.to_user_id = this.report_client ? this.params.therapist_id : null
    form.token =  this.logUser.token;
    form.type = 'report';
    await this.commonService.showLoader();
    this.apiService.send('report',form).subscribe({
      next:async (res:any)=>{
        console.log('res',res);
      await  this.commonService.dismissLoading();
        this.commonService.presentAlert(res.message)
        this.router.navigate(['/tabs/home'])
      },
      error:async (err:any)=>{
        console.log('err',err);
      await this.commonService.dismissLoading();     
      }
    })
  }
}
