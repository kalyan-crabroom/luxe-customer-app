import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
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
    about_me: [
      { type: "required", message: "About me is required." },

    ],
    // gender: [
    //   { type: "required", message: "Gender is required." },
    // ],
    phone: [
      { type: "pattern", message: "Phone number must contain exactly 10 digits and only numbers." }
    ]
  };

  userData: any;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private cdref: ChangeDetectorRef,
    private fb: FormBuilder,
    private navController: NavController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private alertCtrl: AlertController,
  ) {
    this.edit_profile = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['',], //Validators.required
      phone: new FormControl('',),//Validators.pattern('^[0-9]{10}$')
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')]],
      zip_code: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(7)]],
      about_me: [''],
      // gender: [''],
      equipmentArray: this.fb.array([])
    });
    this.addEquipment();

    this.edit_profile.get('about_me')?.valueChanges.subscribe(value => {
      const formatted = this.capitalizeSentences(value);
      if (value !== formatted) {
        this.edit_profile.get('about_me')?.setValue(formatted, { emitEvent: false });
      }
    });

  }

  capitalizeSentences(text: string): string {
    return text
      .split(/([.!?]\s*)/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }


  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        console.log('user', this.logUser)
        this.edit_profile.patchValue(this.logUser);
        this.edit_profile.controls['about_me'].setValue(this.logUser?.user_meta?.about_me);
        // this.edit_profile.controls['gender'].setValue(this.logUser?.user_meta?.gender);
        this.equipmentArray.clear();
        if (this.logUser.user_meta.equipment && Array.isArray(this.logUser.user_meta.equipment)) {
          this.logUser.user_meta.equipment.forEach((equipment: any) => {
            this.equipmentArray.push(this.fb.group({
              equipment: [equipment, Validators.required]
            }));
          });
        }
        this.profile_img = this.logUser.user_meta.profile_image;
        this.getTherapistData();
        this.cdref.detectChanges();
      }
    });
    this.addEquipment();
  }

  ionViewWillEnter(){
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getTherapistData();
      }
    });
  }

  getTherapistData() {
    let payLoad = {
      user_id: this.logUser.id
    }
    this.apiService.sendData('userInfoById', payLoad).subscribe((res: any) => {
      this.profile_img = res.data.profile_image;
      this.userData = res.data;
    }, (err: any) => {
      console.log("error:", err.error);
    });
  }

  get equipmentArray(): FormArray {
    return this.edit_profile.get('equipmentArray') as FormArray;
  }

  addEquipment() {
    const equipmentGroup = this.fb.group({
      equipment: ['', Validators.required]
    });
    this.equipmentArray.push(equipmentGroup);
  }

  removeEquipment(index: number) {
    this.equipmentArray.removeAt(index);
  }

  onSubmit(form: any) {
    form.token = this.logUser.token;
    form.profile_image = this.profile_img;
    form.equipment = form.equipmentArray.map((equipmentGroup: any) => equipmentGroup.equipment);
    this.commonService.showLoader();
    this.apiService.send('update-user', form).subscribe({
      next: (res: any) => {
        console.log('resUpdate', res);
        this.commonService.dismissLoading();
        this.logUser.first_name = form.first_name;
        this.logUser.last_name = form.last_name;
        this.logUser.phone = form.phone;
        this.logUser.zip_code = form.zip_code;
        this.logUser.user_meta.about_me = form.about_me;
        this.logUser.user_meta.equipment = form.equipment;
        // this.logUser.user_meta.gender = form.gender;
        this.storageService.saveToStorage('deeplyCalm:therapist', this.logUser);
        this.storageService.refresh_storage.next(this.logUser);
        this.navController.navigateRoot(['/profile']);
        this.commonService.presentToast(res.message, 'success');
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
    this.apiService.send1('uploadProfile', formData, this.logUser.token).subscribe({
      next: (res: any) => {
        console.log('Response received:', res);
        this.commonService.dismissLoading();
        this.profile_img = res.profile_image_url;
        this.logUser.user_meta.profile_image = this.profile_img;
        this.storageService.saveToStorage('deeplyCalm:therapist', this.logUser);
        this.edit_profile.patchValue({ profile_image: this.profile_img });
        this.cdref.detectChanges();
        this.commonService.presentToast("Image uploaded!", 'success');
      },
      error: (err: any) => {
        console.log('Error received:', err);
        this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    });
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
          this.apiService.send1("delete_licensure", payload, this.logUser.token).subscribe((res: any) => {
            this.commonService.dismissLoading();
            this.commonService.presentAlert(res.message);
            this.userData.specialities.splice(index, 1);
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
}
