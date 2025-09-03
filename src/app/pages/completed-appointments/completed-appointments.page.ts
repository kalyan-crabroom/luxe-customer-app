import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-completed-appointments',
  templateUrl: './completed-appointments.page.html',
  styleUrls: ['./completed-appointments.page.scss'],
})
export class CompletedAppointmentsPage implements OnInit {
  logUser: any
  showSpinner: number = 0
  fetching: any
  page: number = 1;
  total_completed: number = 0;
  completedData: any = []
  transactionHistory: any
  helptext: any;
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute
  ) { 
    if (this.commonService.helptext.length > 0) {
    this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'my_transaction');
    }

  }

  ngOnInit() {
    // this.route.queryParams.subscribe((params: any) => {
    //   this.transactionHistory = params['transaction_history'];
    // });

    var data:any = this.router.getCurrentNavigation()?.extras.state;
    if(data?.transaction_history){
      this.transactionHistory = data?.transaction_history;
      console.log('this.transactionHistory',this.transactionHistory);
    }

    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      this.logUser = user;
      this.getCompletedAppoitmnets()
    });
  }

  getCompletedAppoitmnets(event: any = null) {
    if (event) {
      this.showSpinner = 3;
    } else {
      this.showSpinner = 1;
    }
    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    this.fetching = this.apiService.fetchData(`getBookingHistory?page=${this.page}`, this.logUser.token).subscribe({
      next: (res: any) => {
        this.showSpinner = 2;
        console.log("booking completed", res)
        if (event) {
          event.target.complete()
        }
        if (res && Array.isArray(res.data.data)) {
          if (event && this.page === 1) {
            this.completedData = res.data.data;
          } else {
            this.completedData = [...this.completedData, ...res.data.data];
          }
          this.total_completed = res.data.total;
        } else {
          this.completedData = [];
        }
      }, error: (err: any) => {
        this.showSpinner = 2;
        if (event) {
          event.target.complete();
        }
      }
    })
  }

  loadMore(event: any) {
    this.page++;
    this.getCompletedAppoitmnets(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    this.getCompletedAppoitmnets(event);
  }

  goToBooking(item: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: item.id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }
}
