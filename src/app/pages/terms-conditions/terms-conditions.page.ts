import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.page.html',
  styleUrls: ['./terms-conditions.page.scss'],
})
export class TermsConditionsPage implements OnInit {
  termsData: any = []
  showSpinner: boolean = true;
  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.showData()
  }

  showData() {
    this.showSpinner = true
    this.apiService.get('pages').subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.showSpinner = false;
        if (res.data && res.data.length > 0) {
          const data = res.data.find((page: any) => page.slug === 'terms-and-conditions');
          this.termsData = data ? data : null;
        } else {
          this.termsData = null;
        }
      },
      error: (err: any) => {
        this.showSpinner = false;
        this.termsData = null;
      }
    })
  }

}
