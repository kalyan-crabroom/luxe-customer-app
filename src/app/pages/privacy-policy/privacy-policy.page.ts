import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit {
  privacyPolicyData: any = null;
  showSpinner: boolean = true;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.showPrivacyPolicy();
  }

  showPrivacyPolicy() {
    this.showSpinner = true;
    this.apiService.get('pages').subscribe((res: any) => {
      this.showSpinner = false;
      if (res.data && res.data.length > 0) {
        const privacyPage = res.data.find((page: any) => page.slug === 'privacy-policy');
        this.privacyPolicyData = privacyPage ? privacyPage : null;
      } else {
        this.privacyPolicyData = null;
      }
    }, (err: any) => {
      this.showSpinner = false;
      this.privacyPolicyData = null;
    });
  }
  
}
