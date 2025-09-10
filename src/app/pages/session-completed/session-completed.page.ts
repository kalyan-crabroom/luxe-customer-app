import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-session-completed',
  templateUrl: './session-completed.page.html',
  styleUrls: ['./session-completed.page.scss'],
})
export class SessionCompletedPage implements OnInit {
  sessionComplete : FormGroup
  rate : number = 0;
  logUser : any = []
  bookingData : any
  params : any = []
  validation_messages = {
    message: [
      { type: "required", message: "Please Enter Message." },
    ],
  };
  sessionDetails:any;
  selectedCompliments: string[] = [];
  compliments: string[] = ['Friendly', 'Clean', 'Punctual', 'Respectful'];

  constructor(
    private apiService : ApiService,
    private commonService : CommonService,
    private storageService : StorageService,
    private router : Router
  ) { 
    this.sessionComplete = new FormGroup({
      rating : new FormControl(0),
      message : new FormControl('')
    })
  }

  ngOnInit() {
    if(this.router.getCurrentNavigation()?.extras.state){
      this.params = this.router.getCurrentNavigation()?.extras.state;
      if(this.params){
        this.sessionDetails = this.params;
        console.log("sessionDetails :",this.sessionDetails);
      }
    }
    
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        console.log('log',this.logUser.token);      
      }
    });

  }

  onSubmit(form:any){
    form.token = this.logUser.token
    form.booking_id = this.params.id;
    form.to_user_id = this.params.therapist_info.user_id;
    form.complements = this.selectedCompliments;
    console.log("form :",form); 
    this.commonService.showLoader();
    this.apiService.send('user-rating',form).subscribe({
      next:(res:any)=>{
        console.log('res',res);
        this.commonService.dismissLoading();
        this.commonService.presentToast(res.message,'success');
        this.apiService.location_refresh.next(1);
        this.router.navigate(['/tabs/home']);   
      },
      error:(err:any)=>{
        console.log('err',err);
        this.commonService.dismissLoading();
        if (err?.error?.message) {
          this.commonService.presentAlert(err?.error?.message);
        } else {
          this.commonService.presentAlert("Unable to process this request, Please try after sometimes");
        }
      }
    })
  }

  selectRate(rate: number){
    this.rate = rate + 1;
    this.sessionComplete.patchValue({rating:this.rate})
  }

  // goToReport() {
  //   this.router.navigate(['/report-session'], { state: this.sessionDetails });
  // }

  goToReport() {
    let parameter: NavigationExtras = {
      queryParams: {
        bookingData: JSON.stringify({ ...this.sessionDetails }),
        report_client : true,
      }
    }
    this.router.navigate(['/report-session'], parameter)
  }
  isComplimentSelected(compliment: string): boolean {
    return this.selectedCompliments.includes(compliment);
  }

  toggleCompliment(compliment: string) {
    if (this.isComplimentSelected(compliment)) {
      this.selectedCompliments = this.selectedCompliments.filter((c) => c !== compliment);
    } else {
      this.selectedCompliments.push(compliment);
    }
  }

  goToTherapist(id:any){
    console.log('id',id);
    const parameter : NavigationExtras = {
      queryParams : {
        therapist_id : id
      }
    }
    this.router.navigate(['therapist-profile'],parameter)
  }
}
