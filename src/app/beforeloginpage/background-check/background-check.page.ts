import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-background-check',
  templateUrl: './background-check.page.html',
  styleUrls: ['./background-check.page.scss'],
})
export class BackgroundCheckPage implements OnInit {

  //user_id: any;
  user_detail: any
  // selectedFile: File | undefined;
  // fileContent: string | ArrayBuffer | null = '';
  fileUrl: any;
  frontLicanceImage: any;
  backLicanceImage: any;
  backgroundCheckForm!: FormGroup;
  massageCertification: any;
  massageInsurance: any;
  // logUser: any;
  isSubmit: boolean = true;
  uploadingFileType: any = "";
  isModalOpen: boolean = false;
  responseMessage: string = '';
  submitDisabled: boolean = true;
  background_check: any;

  uploadInProgress = false;
  uploadProgress = 0;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private navCtrl: NavController,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit() {
    var user_detail = this.route.snapshot.paramMap.get('signup_id');
    if (user_detail) {
      this.user_detail = JSON.parse(user_detail);
    }
    console.log("singup id is", this.user_detail);

    // this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
    //   if (user != null) {
    //     this.logUser = user;
    //     console.log("signup user", this.logUser);
    //   }
    // });

    this.backgroundCheckForm = this.fb.group({
      UserId: [this.user_detail.id, Validators.required],
      FrontLicanceImage: ['', Validators.required],
      BackLicanceImage: ['', Validators.required],
      SocialSecurityNumber: ['', Validators.required],
      MassageCertification: ['', Validators.required],
      MassageInsurance: ['', Validators.required],
      BackgroundCheck: ['', Validators.required]
    })

  }

  async presentActionSheet(fileType: any) {
    if (this.uploadingFileType) {
      this.commonService.presentToast('Wait to upload file', 'warning');
      return;
    }
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Source',
      buttons: [
        {
          text: 'Upload File',
          icon: 'document',
          handler: () => {
            if (fileType == 'license_front') {
              document.getElementById("front_license")?.click();
            } else if (fileType == 'license_back') {
              document.getElementById("back_license")?.click();
            } else if (fileType == 'massage_certification') {
              document.getElementById("certification_massage")?.click();
            } else if (fileType == 'massage_insurance') {
              document.getElementById("insurance_massage")?.click();
            }
          }
        },
        {
          text: 'Take Picture',
          icon: 'camera',
          handler: () => {
            this.takePicture(fileType);
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

  async takePicture(fileType: any) {
    console.log('Taking picture');
    const image = await Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    const blob = await this.uriToBlob(image.webPath);
    this.uploadingFileType = fileType;
    await this.uploadFile(blob, fileType);
  }

  private async uriToBlob(uri: any): Promise<Blob> {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  }

  uploadDocFile(event: any, imageType: any): void {
    this.uploadingFileType = imageType;
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image')) {
      // this.selectedFile = file;

      // const reader = new FileReader();
      // reader.onload = async () => {
      //   this.fileUrl = reader.result as string;

      this.uploadFile(file, imageType);


      // reader.readAsDataURL(file);
    } else {
      this.uploadingFileType = "";
      //alert('Please select an image file.');
    }

  }

  handelBanckgorundCheck(event: any) {
    this.backgroundCheckForm.patchValue({
      BackgroundCheck: event.target.value
    })
    if (!this.backgroundCheckForm.valid) {
      this.submitDisabled = true;
    } else {
      this.submitDisabled = false;
    }
  }

  checkInput() {
    if (!this.backgroundCheckForm.valid) {
      this.submitDisabled = true;
    } else {
      this.submitDisabled = false;
    }
  }

  // enterOnlyNumber(event: any) {
  //   const inputValue: string = event.target.value;
  //   const numericValue: string = inputValue.replace(/\D/g, '').slice(0, 9);
  //   this.backgroundCheckForm.patchValue({
  //     SocialSecurityNumber: numericValue
  //   });
  //   this.checkInput();
  // }

  // async uploadFile(file: any, fileType: any){
  //   const formData = new FormData();
  //   formData.append("image", file);
  //   formData.append("key", fileType);
  //   formData.append("user_id", this.user_detail.id);
  // await this.apiService.uploadbackgroundCheckImage("upload-baseimage", formData).subscribe({
  //   next: (res: any) => {
  //     if(fileType == 'license_front'){
  //     this.backgroundCheckForm.patchValue({
  //       FrontLicanceImage: res.file_url,
  //     })
  //     this.frontLicanceImage = res.file_url;
  //     } else if(fileType == 'license_back'){
  //       this.backgroundCheckForm.patchValue({
  //         BackLicanceImage: res.file_url,
  //       })
  //       this.backLicanceImage = res.file_url;
  //     } else if(fileType == 'massage_certification'){
  //       this.backgroundCheckForm.patchValue({
  //         MassageCertification: res.file_url,
  //       })
  //       this.massageCertification = res.file_url;
  //     } else if(fileType == 'massage_insurance'){
  //       this.backgroundCheckForm.patchValue({
  //         MassageInsurance: res.file_url,
  //       })
  //       this.massageInsurance = res.file_url;
  //     }
  //     this.uploadingFileType = "";
  //     if(!this.backgroundCheckForm.valid){
  //       this.submitDisabled = true;
  //       } else {
  //         this.submitDisabled = false;
  //       }
  //   }, error: (error: any) => {
  //     this.uploadingFileType = "";
  //     this.commonService.dismissLoading();
  //     if(error.error.message){
  //     this.commonService.presentAlert(error.error.message);
  //     }
  //   }
  // })
  // }

  async uploadFile(file: any, fileType: any) {
    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      this.commonService.presentAlert('File size exceeds the limit of 10 MB.');
      this.uploadingFileType = "";
      return;
    }

    this.uploadInProgress = true;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", fileType);
    formData.append("user_id", this.user_detail.id);
    const uploadUrl = "https://backend.luxetouch.com/api/v1/auth/upload-baseimage"; // Replace with your actual upload URL
    const req = this.http.post(uploadUrl, formData, {
      reportProgress: true, // Enable progress events
      observe: 'events' // Receive events to handle progress
    });

    req.subscribe((event: any) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        // Update progress bar or show progress indicator
        console.log(`File is ${this.uploadProgress}% uploaded.`);
        // You can update your progress bar here
      } else if (event.type === HttpEventType.Response) {
        // Upload completed successfully
        const res: any = event.body;
        // Handle response and update UI accordingly
        if (fileType == 'license_front') {
          this.backgroundCheckForm.patchValue({
            FrontLicanceImage: res.file_url,
          });
          this.frontLicanceImage = res.file_url;
        } else if (fileType == 'license_back') {
          this.backgroundCheckForm.patchValue({
            BackLicanceImage: res.file_url,
          });
          this.backLicanceImage = res.file_url;
        } else if (fileType == 'massage_certification') {
          this.backgroundCheckForm.patchValue({
            MassageCertification: res.file_url,
          });
          this.massageCertification = res.file_url;
        } else if (fileType == 'massage_insurance') {
          this.backgroundCheckForm.patchValue({
            MassageInsurance: res.file_url,
          });
          this.massageInsurance = res.file_url;
        }
        this.uploadingFileType = "";
        if (!this.backgroundCheckForm.valid) {
          this.submitDisabled = true;
        } else {
          this.submitDisabled = false;
        }
      }
    }, (error: any) => {
      this.uploadingFileType = "";
      this.commonService.dismissLoading();
      if (error.error.message) {
        this.commonService.presentAlert(error.error.message);
      }
    }).add(() => {
      this.uploadProgress = 0;
      this.uploadInProgress = false; // Hide progress indicator when upload completes or errors
    });;

  }


  async onSubmit() {
    if (!this.backgroundCheckForm.valid) {
      this.isSubmit = true;
      return;
    }
    await this.commonService.showLoader();
    let payload = {
      user_id: this.user_detail.id,
      license_front: this.backgroundCheckForm.value.FrontLicanceImage,
      license_back: this.backgroundCheckForm.value.BackLicanceImage,
      massage_certification: this.backgroundCheckForm.value.MassageCertification,
      massage_insurance: this.backgroundCheckForm.value.MassageInsurance,
      social_security_number: this.backgroundCheckForm.value.SocialSecurityNumber,
      background_check: this.backgroundCheckForm.value.BackgroundCheck,
      //token: this.user_detail.token
    }
    this.apiService.sendData("BackgroundCheckTherapist", payload).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        this.isModalOpen = true;
        this.responseMessage = res.message;
      }, error: (error: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(error.error.message);
      }
    })
  }

  removeImage(fileType: any) {
    this.uploadingFileType = fileType;
    let payload = {
      user_id: this.user_detail.id,
      key: fileType
    }
    this.apiService.sendData("remove-image", payload).subscribe({
      next: (res: any) => {
        if (fileType == 'license_front') {
          this.backgroundCheckForm.patchValue({
            FrontLicanceImage: null,
          })
          this.frontLicanceImage = null;
        } else if (fileType == 'license_back') {
          this.backgroundCheckForm.patchValue({
            BackLicanceImage: null,
          })
          this.backLicanceImage = null;
        } else if (fileType == 'massage_certification') {
          this.backgroundCheckForm.patchValue({
            MassageCertification: null,
          })
          this.massageCertification = null;
        } else if (fileType == 'massage_insurance') {
          this.backgroundCheckForm.patchValue({
            MassageInsurance: null,
          })
          this.massageInsurance = null;
        }
        this.uploadingFileType = "";
        this.checkInput();
      }, error: (error: any) => {
        this.commonService.presentAlert(error.error.message);
      }
    })
  }

  async goToLogin() {
    this.isModalOpen = false;
    this.cd.detectChanges();
    this.navCtrl.navigateRoot(['/login']);
    // const loginData = {
    //   email: this.user_detail.email,
    //   password: this.user_detail.password,
    //   user_role: '2'
    // };
    // await this.doLogin(loginData);
  }

  async doLogin(data: any) {
    await this.commonService.showLoader();
    this.apiService.doLogin(data).subscribe({
      next: async (res: any) => {
        await this.commonService.dismissLoading();
        this.isModalOpen = false;
        this.cd.detectChanges();
        this.storageService.saveToStorage('deeplyCalm:user', res.data.user);
        // this.commonService.presentToast('Login Successfully', 'success');
        this.navCtrl.navigateRoot(['/first-time-user-tutorial']);
      }, error: (err: any) => {
        this.commonService.dismissLoading();
        if (err.error.message) {
          this.commonService.presentAlert(err.error.message);
        } else {
          this.commonService.presentAlert("Something went wrong, Please try again");
        }
      }
    });
  }

}
