import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-my-reviews',
  templateUrl: './my-reviews.page.html',
  styleUrls: ['./my-reviews.page.scss'],
})
export class MyReviewsPage implements OnInit {
  therapistData: any
  logUser: any
  reviewsData: any = []
  starBox: number[] = [1, 2, 3, 4, 5];
  page: number = 1
  total_reviews: number = 0
  showSpinner: number = 0
  complementsViews: any = []
  fetching: any
  type: string = ''
  ready: boolean = false;
  ready1: boolean = false;
  helptext: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    if (this.commonService.helptext.length > 0) {
    this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'my_review');
    }
   }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params.therapist_data) {
        this.therapistData = JSON.parse(params.therapist_data);
        console.log('therapistData', this.therapistData);
      }
      this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
        this.logUser = user;
        this.getTherapistReviews()
      });
    })
  }
  getTherapistReviews() {
    this.ready = false;
    this.apiService.fetchData(`get-user-by-ratings`, this.logUser.token).subscribe((res: any) => {
      console.log('res', res);
      this.ready = true;
      this.reviewsData = res.ratings;
      this.complementsViews = res.counts
    }, (err: any) => {
      this.ready = true;
    })
  }

  fetchReviews(type: string) {
    // this.commonService.showLoader()
    this.ready = false;
    this.apiService.fetchData(`get-user-by-ratings?type=${type}`, this.logUser.token).subscribe((res: any) => {
      console.log('res', res);
      // this.commonService.dismissLoading();
      this.ready = true;
      this.reviewsData = res.ratings;
    }, (err: any) => {
      console.log('err', err);
      // this.commonService.dismissLoading();
      this.ready = true;
    })
  }

  // getTherapistReviews(event: any = null) {
  //   if (event) {
  //     this.showSpinner = 3;
  //   } else {
  //     this.showSpinner = 1;
  //   }
  //   if (this.fetching) {
  //     this.fetching.unsubscribe();
  //   }
  //   // let url = `get-user-by-ratings?page=${this.page}`;
  //   // if (this.type) {
  //   //   url += `&type=${this.type}`;
  //   // }
  //   this.fetching = this.apiService.fetchData(`get-user-by-ratings?page=${this.page}`, this.logUser.token).subscribe((res: any) => {
  //     console.log('res>>', res);
  //     this.showSpinner = 2;
  //     if (event) {
  //       event.target.complete();
  //     }
  //     if (res && Array.isArray(res.ratings.data)) {
  //       if (event && this.page === 1) {
  //         this.reviewsData = res.ratings.data
  //         console.log('reviewsData1', this.reviewsData);
  //       } else {
  //         this.reviewsData = [...this.reviewsData, ...res.ratings.data]
  //         console.log('reviewsData2', this.reviewsData);
  //       }
  //       this.total_reviews = res.ratings.total;
  //       this.complementsViews = res.counts;
  //       console.log('complements', this.complementsViews);

  //       console.log('TotalreviewsData', this.total_reviews);
  //     } else {
  //       this.reviewsData = [];
  //     }

  //   }, (err: any) => {
  //     this.showSpinner = 2;
  //     if (event) {
  //       event.target.complete();
  //     }
  //     console.log('err', err);

  //   })
  // }
  loadMore(event: any) {
    this.page++;
    // this.getTherapistReviews(event);
  }

  handleRefresh(event: any) {
    this.page = 1;
    this.showSpinner = 3;
    // this.getTherapistReviews(event);
  }

  // fetchReviews(type: string) {
  //   this.type = type;
  //   console.log('type', this.type);
  //   this.page = 1;
  //   this.getTherapistReviews();
  // }


}
