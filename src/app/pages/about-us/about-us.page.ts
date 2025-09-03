import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
})
export class AboutUsPage implements OnInit {
  aboutData: any = []
  logUser: any
  showSpinner: boolean = true;
  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.aboutUsData()
  }

  aboutUsData() {
    this.showSpinner = true;
    this.apiService.get('pages').subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.showSpinner = false;
        if (res.data && res.data.length > 0) {
          const aboutPage = res.data.find((page: any) => page.slug === 'about-us');
          if (aboutPage) {
            this.aboutData = aboutPage;
          }
        }
      },
      error: (err: any) => {
        this.showSpinner = false;
        console.log('err', err);
      }
    });
  }
}
