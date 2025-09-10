import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';




@Component({
  selector: 'app-therapist-profile',
  templateUrl: './therapist-profile.page.html',
  styleUrls: ['./therapist-profile.page.scss'],
})
export class TherapistProfilePage implements OnInit {
  logUser: any
  therapist_id: any
  therapist_data: any = []
  starBox: number[] = [1, 2, 3, 4, 5];
  isLiked: boolean = false;
  isModalOpen: boolean = false;
  is_ready: boolean = false;
  therapist_gallery:any = []
  mediaUrl: string | undefined;
  isLoading = true;
  currentVideoUrl:any
  mediaType: 'image' | 'video' | undefined;
  currentSlideIndex: number = 0;
  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private cdref: ChangeDetectorRef
  ) { 
    
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params.therapist_id) {
        this.therapist_id = params.therapist_id
      }
    })
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      this.logUser = user;
      console.log('loguser', this.logUser);
      this.getTherapistDetails()
    });
  }


  async getTherapistDetails() {
    const payLoad = {
      user_id: this.therapist_id,
      token: this.logUser.token
    }
    this.is_ready = true;
    this.apiService.send('get-therapist-profile', payLoad).subscribe(async (res: any) => {
      this.is_ready = false;
      console.log('res', res);
      this.therapist_data = res.data;
      this.therapist_gallery = res.data.gallery      
    }, async (err: any) => {
      console.log('err', err);
      this.is_ready = false;
    })
  }

  goToBook() {
    let parameter: NavigationExtras = {
      queryParams: {
        therapist_data: JSON.stringify(this.therapist_data)
      }
    }
    this.router.navigate(['book-now'], parameter);
  }

  favouriteTherapist() {
    this.therapist_data.favorite = !this.therapist_data.favorite;
    this.cdref.detectChanges();
    const payLoad = {
      token: this.logUser.token,
      therapist_id: this.therapist_data.id,
      favorite: this.therapist_data.favorite
    }
    this.apiService.send('add-favorite-therapist', payLoad).subscribe((res: any) => {
      this.apiService.location_refresh.next(1);
      console.log('res', res);
    }, (err: any) => {
      this.commonService.presentAlert(err.error.message);
    });
  }

  openMediaModal(mediaUrl: string, type: 'image' | 'video') {
    this.isModalOpen = true;
    this.currentSlideIndex = this.therapist_gallery.findIndex((item:any)=> item.media === mediaUrl);
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  isItemVisible(item: any): boolean {
    return this.mediaUrl === item.media;
  }

  openVideo(videoUrl: string) {
    this.currentVideoUrl = videoUrl;
    this.isModalOpen = true;
  }

  goToChat(){
    const parameter: NavigationExtras = {
      queryParams: {
        chat_data: JSON.stringify({
          userId: this.therapist_data.id,
          first_name: this.therapist_data.first_name,
          last_name :this.therapist_data.last_name,
          profile_image: this.therapist_data.profile_image
        })
      }
    };
    this.router.navigate(['/message-details'], parameter);
  }

}
