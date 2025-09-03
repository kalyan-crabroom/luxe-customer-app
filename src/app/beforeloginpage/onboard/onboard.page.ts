import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@capgo/inappbrowser'
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.page.html',
  styleUrls: ['./onboard.page.scss'],
  standalone: false
})
export class OnboardPage implements OnInit {
  user_detail: any
  constructor(
    private router: Router,
    private navCtrl: NavController
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.user_detail = navigation.extras.state['user_detail'];
      console.log("user_detail :", this.user_detail);
    }
  }

  ngOnInit() {
  }

  continueSignup() {
    this.router.navigate(['/background-check'], { state: { user_detail: this.user_detail } });
  }

  openOnboardLink() {
    const platform = Capacitor.getPlatform();
    let url = 'https://www.luxetouch.com/step1-provider-application';
    if (platform === 'web') {
      window.open(url, '_blanck');
    } else {
      InAppBrowser.open({ url: url });
    }
  }

}
