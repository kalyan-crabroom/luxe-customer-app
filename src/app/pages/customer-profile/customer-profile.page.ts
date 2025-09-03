import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.page.html',
  styleUrls: ['./customer-profile.page.scss'],
})
export class CustomerProfilePage implements OnInit {
  customer_id: any
  logUser: any
  user_details: any = []
  starBox: number[] = [1, 2, 3, 4, 5];
  ready: boolean = false;
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params.customer_id) {
        this.customer_id = params.customer_id
      }
    })
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      this.logUser = user;
      this.getCustomerDetails()
    });
  }

  getCustomerDetails() {

    let payload = {
      user_id: this.customer_id
    }
    this.ready = false;
    this.apiService.sendData("userInfoById", payload).subscribe({
      next: async (res: any) => {
        this.user_details = res.data;
        this.ready = true;

      }, error: (err: any) => {
        this.ready = true;
        this.commonService.presentAlert(err.error.message)
      }
    })
  }

  chat(item: any) {
    const parameter: NavigationExtras = {
      queryParams: {
        chat_data: JSON.stringify({
          userId: item.id,
          first_name: item.first_name,
          last_name: item.last_name,
          profile_image: item.profile_image
        })
      }
    };
    this.router.navigate(['/message-details'], parameter);
  }
}
