import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  edit_profile: FormGroup
  logUser: any = [];
  profile_img: any
  image_id: any;
  image_url: any;
  validation_messages = {
    first_name: [
      { type: "required", message: "First name is required." }
    ],
    last_name: [
      { type: "required", message: "Last name is required." },
    ],
    zip_code: [
      { type: "required", message: "Zip code is required." },
      { type: 'minlength', message: "Minimum 5-7 digits are allowed" },
      { type: 'maxlength', message: "maximum 7 digits are allowed" },
    ],
    email: [
      { type: "required", message: "Email is required." },
      { type: "pattern", message: "Enter a valid email." }
    ],
    phone: [
      { type: "pattern", message: "Phone number must contain exactly 10 digits and only numbers." }
    ]
  };
  timezone: any;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private cdref: ChangeDetectorRef,
    private router: Router,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.edit_profile = new FormGroup({
      first_name: new FormControl("", Validators.compose([
        Validators.required
      ])),
      last_name: new FormControl("", Validators.compose([
        Validators.required
      ])),
      phone: new FormControl('', Validators.pattern('^[0-9]{10}$')),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')
      ])),
      zip_code: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(7)
      ])),
    })
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.edit_profile.patchValue(this.logUser);
        this.profile_img = this.logUser.user_meta.profile_image;
        this.getAllDetails();
      }
    });
  }

  ngOnInit() {

  }

  async getAllDetails() {
    await this.commonService.showLoader();
    this.apiService.fetchData(`customerProfile`, this.logUser.token).subscribe(async (res: any) => {
      this.edit_profile.patchValue(res.data);
      await this.commonService.dismissLoading();
      this.profile_img = res.data.profile_image;
    }, async (err: any) => {
      await this.commonService.dismissLoading();
    })
  }


  onSubmit(form: any) {
    form.token = this.logUser.token;
    form.profile_image = this.profile_img;
    this.commonService.showLoader();
    this.apiService.send('update-user', form).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.commonService.dismissLoading();
        this.logUser.first_name = form.first_name;
        this.logUser.last_name = form.last_name;
        this.logUser.phone = form.phone;
        this.logUser.zip_code = form.zip_code;
        this.storageService.saveToStorage('deeplyCalm:user', this.logUser);
        this.storageService.refresh_storage.next(this.logUser);
        this.router.navigate(['/tabs/myaccount']);
        this.commonService.presentAlert(res.message);
        this.updateUserZipCodetimezone(form.zip_code);
      },
      error: (err: any) => {
        console.log('err', err);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.message);
      }
    });
  }


  async takePicture() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Source',
      buttons: [
        {
          text: 'From Photos',
          icon: 'image',
          handler: async () => {

            try {
              const image: any = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Photos
              });
              this.uploadImage(image);
            } catch (error) {
              console.log('Failed to image.');
            }
          }
        },
        {
          text: 'Take Picture',
          icon: 'camera',
          handler: async () => {
            try {
              const image: any = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera
              });
              this.uploadImage(image);
            } catch (error) {
              console.log('Failed to image.');
            }
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

  async uploadImage(image: any) {
    let fileName = new Date().getTime() + '.' + image.format;
    const base64Response = await fetch(`data:application/octet-stream;base64,${image.base64String}`);
    const blobData = await base64Response.blob();
    const formData = new FormData();
    formData.append("profile_image", blobData, fileName);
    formData.append("image_format", image.format);
    formData.append("token", this.logUser.token);
    formData.append("type", 'profile_image');
    this.commonService.showLoader();
    this.updateUserZipCodetimezone
    this.apiService.send1('uploadProfile', formData, this.logUser.token).subscribe({
      next: (res: any) => {
        console.log('Response received:', res);
        this.commonService.dismissLoading();
        this.profile_img = res.profile_image_url;
        this.logUser.user_meta.profile_image = this.profile_img;
        this.storageService.saveToStorage('deeplyCalm:user', this.logUser);
        this.edit_profile.patchValue({ profile_image: this.profile_img });
        this.cdref.detectChanges();
      },
      error: (err: any) => {
        console.log('Error received:', err);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    });
  }

  updateUserZipCodetimezone(zipcode: any) {
    this.apiService.getTimezoneByZip(zipcode).subscribe(
      async (res: any) => {
        console.log("getTimezoneByZip res:", res);
        if (res.timeZoneId) {
          this.timezone = res.timeZoneId;
        } else {
          this.timezone = this.apiService.getDeviceTimezone();
          console.log('Timezone not found, using device timezone:', this.timezone);
        }

        this.apiService.send('updateUserZipCodeTimezone', { timezone: this.timezone, token: this.logUser.token }).subscribe(
          async (updateRes: any) => {
            this.logUser.user_zipcode_timezone = updateRes.zipcode;
            await this.storageService.saveToStorage('deeplyCalm:user', this.logUser);
          }, (err) => {
            console.log("Error updating timezone:", err);
          });
      }, (err) => {
        console.log("Error fetching timezone:", err);
      });
  }
}


