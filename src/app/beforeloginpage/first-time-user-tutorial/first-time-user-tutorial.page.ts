import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

import { Swiper } from 'swiper';

@Component({
  selector: 'app-first-time-user-tutorial',
  templateUrl: './first-time-user-tutorial.page.html',
  styleUrls: ['./first-time-user-tutorial.page.scss'],
})
export class FirstTimeUserTutorialPage implements OnInit {
  // @ViewChild('swiper', { static: false }) swiperContainer: any;
  @ViewChild('swiper', { static: false }) swiperContainer!: ElementRef;
  is_ready:boolean = false;
  tutorialData:any;

  constructor(
    private navCtrl:NavController,
    private apiService:ApiService
  ){

  }

  ngOnInit(): void {
    this.getFirstTimeTutorialData();
  }


  swiper!: Swiper;

  ngAfterViewInit() {
    // Ensure Swiper instance is properly initialized
    this.initializeSwiper();
  }

  private initializeSwiper() {
    if (this.swiperContainer) {
      // Access the Swiper instance from the container
      this.swiper = (this.swiperContainer.nativeElement as any).swiper;
      if (!this.swiper) {
        console.error('Swiper instance not found');
      }
    } else {
      console.error('Swiper container not found');
    }
  }

  nextSlide() {
    if (this.swiper) {
      if (this.swiper.isEnd) {
        this.navCtrl.navigateRoot(["/tabs/home"]); 
      } else {
        this.swiper.slideNext();
      }
    } else {
      console.error('Swiper instance is not available');
    }
  }

  next_carausal(){
    document.getElementById("next_btn")?.click();
  }

  getFirstTimeTutorialData(){
    this.is_ready = true;
    this.apiService.get('pages/get_first_time_tutorial_data').subscribe((res:any)=>{
      this.is_ready = false;
      this.tutorialData = res.data;
    },(err)=>{
      console.log("getFirstTimeTutorialData err :",err.error);
      this.is_ready = false;
    });
  }

}
