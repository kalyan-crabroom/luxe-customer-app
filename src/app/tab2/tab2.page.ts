import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { ActionSheetController, AlertController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  logUser: any = [];
  ratings: number[] = [];
  user_profile: any = []
  user_data: any = []
  equipmentList: any = []
  ready: boolean = false;
  starBox: number[] = [1, 2, 3, 4, 5];
  completedBooking: any;
  is_ready: boolean = false;
  videoUrl: string | null = null;
  thumbnailUrl: string | null = null;
  mediaArray: any = []
  mediaUrl: string | undefined;
  isLoading = true;
  currentVideoUrl: any
  mediaType: 'image' | 'video' | undefined;
  currentSlideIndex: number = 0;
  isModalOpen: boolean = false;
  @ViewChild('video') myVideo!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private storageService: StorageService,
    private cdref: ChangeDetectorRef,
    private router: Router,
    private api: ApiService,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private http: HttpClient,
    private platform: Platform
  ) {

    this.storageService.refresh_storage.subscribe((data: any) => {
      if (data) {
        this.storageService.getFromStorage('deeplyCalm:therapist').then((userD: any) => {
          this.logUser = userD
          this.user_profile = userD.user_meta
          this.getTherapistData()
          this.getCompleteBookings()
        })
      }
    });
  }



  ionViewWillEnter() {
    this.commonService.refresh_mysession.subscribe((res: any) => {
      if (res) {
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.logUser = user;
            this.getCompleteBookings();
          }
        });
      }
    });
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      this.logUser = user;
      this.user_profile = user.user_meta
      console.log('logUser1', this.logUser);
      this.cdref.detectChanges();
      this.getTherapistData()
      this.getCompleteBookings()
    });
  }

  getCompleteBookings() {
    const payLoad = {
      token: this.logUser.token,
      status: 'history'
    }
    this.ready = false;
    this.api.send('getBookingByDate', payLoad).subscribe({
      next: (res: any) => {
        console.log('resCompleted>>', res);
        this.ready = true;
        this.completedBooking = res || [];
      },
      error: (err: any) => {
        this.ready = true;
      }
    })
  }

  goToBooking(item: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: item.id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

  getTherapistData() {
    let payLoad = {
      user_id: this.logUser.id
    }
    this.is_ready = true;
    this.api.sendData('userInfoById', payLoad).subscribe((res: any) => {
      this.user_data = res.data;
      this.equipmentList = this.user_data.equipment;
      this.is_ready = false;
    }, (err: any) => {
      this.is_ready = false;
      // this.commonService.presentAlert(err.error.message);
    })
  }

  goToReviews() {
    let parameter: NavigationExtras = {
      queryParams: {
        therapist_data: JSON.stringify({ ...this.user_data })
      }
    }
    this.router.navigate(['my-reviews'], parameter)
  }

  chat(id: any) {
    this.router.navigate(['/message-details/' + id])
  }

  goToEdit(data: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        data: JSON.stringify(data)
      }
    };
    this.router.navigate(['/add-licensure-and-credentials'], parameter);
  }

  async goToDelete(data: any, index: any) {
    let alert = await this.alertCtrl.create({
      header: "Delete!",
      message: "Are you sure?",
      buttons: [{
        text: 'Yes',
        role: 'confirm',
        handler: () => {
          this.commonService.showLoader("Please wait...");
          let payload: any = {
            license_id: data.id
          }
          this.api.send1("delete_licensure", payload, this.logUser.token).subscribe((res: any) => {
            this.commonService.dismissLoading();
            this.commonService.presentAlert(res.message);
            this.user_data.specialities.splice(index, 1);
          }, (err) => {
            console.log("err :", err);
            this.commonService.dismissLoading();
            this.commonService.presentAlert(err.error.message);
          });
        }
      }, {
        text: 'No',
        role: 'cancel',
        handler: () => {
          console.log("cancel");
        }
      }]
    });
    await alert.present();
  }
  
  getFileNameFromPath(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    return parts.pop() || '';
  }
  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Source',
      buttons: [
        {
          text: 'Upload Video',
          icon: 'videocam',
          handler: async () => {
            if (this.platform.is('android')) {
              this.fileInput.nativeElement.click(); // added because crash the app when big video file upload from the android
            } else {
              FilePicker.pickVideos({}).then(async (file: any) => {
                console.log("file :", file);
                if (file.files && file.files.length === 1) {
                  let blobData: any;
                  let fileName: any;
                  const mimeType = file.files[0].mimeType;
                  if (mimeType.startsWith('video/')) {
                    if (this.platform.is('hybrid')) {
                      fileName = this.getFileNameFromPath(file.files[0].path);
                      Filesystem.readFile({ path: file.files[0].path }).then(async (res: any) => {
                        console.log(res);
                        const base64Response = await fetch(`data:application/octet-stream;base64,${res.data}`);
                        console.log("base64Response :", base64Response);
                        blobData = await base64Response.blob();
                        if (blobData) {
                          await this.uploadFile(blobData, fileName, file.files[0].mimeType);
                        } else {
                          console.log('err in converting into the base64');
                        }
                      }, (err: any) => {
                        console.log("Filesystem error:", err);
                      });
                    } else {
                      blobData = file.files[0].blob;
                      fileName = file.files[0].name
                      if (blobData) {
                        await this.uploadFile(blobData, fileName, file.files[0].mimeType);
                      } else {
                        console.log('err in converting into the base64');
                      }
                    }
                  } else {
                    this.commonService.presentAlert("Please select a valid video file.");
                  }
                } else if (file.files && file.files.length > 1) {
                  this.commonService.presentAlert("You can select only one video at a time.");
                } else {
                  this.commonService.presentAlert("No file selected.");
                }
              }, (err: any) => {
                console.log("FilePicker error:", err);
              });
            }

          }
        },
        {
          text: 'From Photos',
          icon: 'image',
          handler: async () => {
            const image: any = await Camera.getPhoto({
              quality: 60,
              allowEditing: false,
              resultType: CameraResultType.Base64,
              source: CameraSource.Photos
            });
            console.log("Gallery", image);
            let fileName = new Date().getTime() + '.' + image.format;
            const base64Response = await fetch(`data:application/octet-stream;base64,${image.base64String}`);
            const blobData = await base64Response.blob();
            console.log(fileName, "blobData Gallery:", blobData);
            await this.uploadFile(blobData, fileName, 'image/' + image.format);
          }
        },
        {
          text: 'Take Picture',
          icon: 'camera',
          handler: async () => {
            const image: any = await Camera.getPhoto({
              quality: 60,
              allowEditing: false,
              resultType: CameraResultType.Base64,
              source: CameraSource.Camera
            });
            console.log("camera", image);
            let fileName = new Date().getTime() + '.' + image.format;
            const base64Response = await fetch(`data:application/octet-stream;base64,${image.base64String}`);
            const blobData = await base64Response.blob();
            console.log(fileName, "blobData :", blobData);
            await this.uploadFile(blobData, fileName, 'image/' + image.format);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length == 1) {
      const file = input.files[0];
      console.log('Selected file:', file);
      const formData = new FormData();
      formData.append("add_file", file);
      formData.append("user_id", this.logUser.id);
      await this.commonService.showLoader("Please wait...");
      this.http.post(environment.API_URL2 + "upload-media", formData).subscribe(async (res: any) => {
        if (res && res.file) {
          this.mediaArray.push({ type: 'video', url: res.file, thumbnail: res.thumbnail, id: res.id });
          this.user_data.gallery_images.push({ type: 'video', media: res.file, thumbnail: res.thumbnail, id: res.id });
          this.cdref.detectChanges();
        } else {
          console.error('Invalid response format:', res);
        }
        this.fileInput.nativeElement.value = null;
        await this.commonService.dismissLoading();
      }, async (err: any) => {
        await this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message || 'An error occurred while uploading the file.');
      });
    } else {
      this.commonService.presentAlert("You can select only one video at a time.");
      this.fileInput.nativeElement.value = null;
    }
  }

  async uploadFile(blobData: Blob, fileName: any, fileType: string) {
    console.log("blobData", blobData);
    console.log("fileName", fileName);
    console.log("fileType", fileType);
    if (!blobData && !fileType) {
      this.commonService.presentAlert('Invalid file data or type.');
      return;
    }
    const formData = new FormData();
    formData.append("add_file", blobData, fileName);
    formData.append("user_id", this.logUser.id);
    const isVideo = fileType.startsWith('video/');
    await this.commonService.showLoader("Please wait...");
    this.http.post(environment.API_URL2 + "upload-media", formData).subscribe(async (res: any) => {
      if (res && res.file) {
        if (isVideo) {
          this.mediaArray.push({ type: 'video', url: res.file, thumbnail: res.thumbnail, id: res.id });
          this.user_data.gallery_images.push({ type: 'video', media: res.file, thumbnail: res.thumbnail, id: res.id });
        } else {
          this.mediaArray.push({ type: 'image', url: res.file, id: res.id });
          this.user_data.gallery_images.push({ type: 'image', media: res.file, id: res.id });
        }
        this.cdref.detectChanges();
      } else {
        console.error('Invalid response format:', res);
      }
      await this.commonService.dismissLoading();
    }, async (err: any) => {
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message || 'An error occurred while uploading the file.');
    });
  }


  async deleteGalaryImage(data: any, index: any) {
    console.log('data', data);
    console.log('index', index);
    let alert = await this.alertCtrl.create({
      header: "Delete!",
      message: "Are you sure?",
      buttons: [{
        text: 'Yes',
        role: 'confirm',
        handler: () => {
          this.commonService.showLoader("Please wait...");
          let payload: any = {
            id: data.id,
            file: data.url
          }
          this.api.send1("delete-media", payload, this.logUser.token).subscribe((res: any) => {
            console.log('resDelete', res);
            this.commonService.dismissLoading();
            this.commonService.presentToast(res.message, "success");
            this.user_data.gallery_images.splice(index, 1);
          }, (err) => {
            console.log("err :", err);
            this.commonService.dismissLoading();
            this.commonService.presentAlert(err.error.message);
          });
        }
      }, {
        text: 'No',
        role: 'cancel',
        handler: () => {
          console.log("cancel");
        }
      }]
    });
    await alert.present();
  }

  openMediaModal(mediaUrl: string, type: 'image' | 'video') {
    this.isModalOpen = true;
    this.currentSlideIndex = this.user_data.gallery_images.findIndex((item: any) => item.media === mediaUrl);
    console.log('currentSlideIndex', this.currentSlideIndex)
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  isItemVisible(item: any): boolean {
    return this.mediaUrl === item.media;
  }

  getBase64(file: any) {
    console.log('file', file);
    let mimeType = file?.type;
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      let self = this;
      reader.onload = function () {
        console.log(reader.result);
        self.cdref.detectChanges();
        let base64: any = reader.result;
        const cleanBase64 = base64.replace(new RegExp(`^data:${mimeType};base64,`), '');
        resolve(cleanBase64);
      };
      reader.onerror = function (error) {
        console.log('reader.onerror: ', error);
        reject('error');
      };
    });
  }

  playVideo(index: any) {
    console.log('play video');
    console.log(this.myVideo)
    // console.log(this.myVideo.nativeElement.play())
  }

}
