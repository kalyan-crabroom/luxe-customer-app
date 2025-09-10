

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { NavController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    public storage: StorageService,
    public navCtrl: NavController,
    private platform: Platform,

  ) {
    this.initilizeStatusBar();

  }

  async initilizeStatusBar() {
    if (this.platform.is('android')) {
      await StatusBar.setBackgroundColor({ color: '#000026' });
    }
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise((resolve) => {
      this.storage.getFromStorage('deeplyCalm:user').then((user) => {
        if (user) {
          resolve(true);
        } else {
          this.navCtrl.navigateRoot(['/login']);
          resolve(false);
        }
      })
    });

  }

}