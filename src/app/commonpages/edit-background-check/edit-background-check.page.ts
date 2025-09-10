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
  selector: 'app-edit-background-check',
  templateUrl: './edit-background-check.page.html',
  styleUrls: ['./edit-background-check.page.scss'],
})
export class EditBackgroundCheckPage implements OnInit {

  //user_id: any;
  // user_detail: any
  selectedFile: File | undefined;
  // fileContent: string | ArrayBuffer | null = '';
  fileUrl: any;
  frontLicanceImage: any;
  backLicanceImage: any;
  editBackgroundCheckForm!: FormGroup;
  massageCertification: any;
  massageInsurance: any;
  // logUser: any;
  isSubmit: boolean = true;
  uploadingFileType: any = "";
  responseMessage: string = '';
  submitDisabled: boolean = true;
  logUser: any;
  backgroundcheck_details: any;

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
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        console.log("signup user", this.logUser);
        this.getUserById(this.logUser.id);
      }
    });

this.editBackgroundCheckForm = this.fb.group({
  UserId: ['', Validators.required],
  FrontLicanceImage: ['', Validators.required],
  BackLicanceImage: ['', Validators.required],
  SocialSecurityNumber: ['', Validators.required],
  MassageCertification: ['', Validators.required],
  MassageInsurance: ['', Validators.required],
  BackgroundCheck: ['', Validators.required]
})
  }

  getUserById(userId: any){
    let payload = {
      user_id: userId
    }
    this.apiService.sendData("userInfoById", payload).subscribe({
      next: async (res: any) => {
        if(res.data){
         this.editBackgroundCheckForm.patchValue({
           UserId: res.data.id,
          FrontLicanceImage: res.data.license_front,
          BackLicanceImage: res.data.license_back,
          SocialSecurityNumber: res.data.social_security_number,
          MassageCertification: res.data.massage_certification,
          MassageInsurance: res.data.massage_insurance,
          BackgroundCheck: res.data.background_check
         });
         this.frontLicanceImage = res.data.license_front;
         this.backLicanceImage = res.data.license_back;
         this.massageCertification = res.data.massage_certification;
         this.massageInsurance = res.data.massage_insurance;
        }
        this.checkInput();
      this.backgroundcheck_details = res.data;
      }, error: (err: any) => {
    
      }
    })
  }

  async presentActionSheet(fileType: any) {
    if(this.uploadingFileType){
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
            if(fileType == 'license_front'){
              document.getElementById("front_license")?.click();
              } else if(fileType == 'license_back'){
                document.getElementById("back_license")?.click();
              } else if(fileType == 'massage_certification'){
                document.getElementById("certification_massage")?.click();
              } else if(fileType == 'massage_insurance'){
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
         this.uploadFile(file, imageType);
        } else {
          this.uploadingFileType = "";
          //alert('Please select an image file.');
        }
      }

  checkInput(){
    if(!this.editBackgroundCheckForm.valid){
      this.submitDisabled = true;
      } else {
        this.submitDisabled = false;
      }
  }

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
     formData.append("user_id", this.logUser.id);
 
     const uploadUrl = "https://bhaveshd.sg-host.com/api/v1/auth/upload-baseimage"; // Replace with your actual upload URL
 
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
                 this.editBackgroundCheckForm.patchValue({
                     FrontLicanceImage: res.file_url,
                 });
                 this.frontLicanceImage = res.file_url;
             } else if (fileType == 'license_back') {
                 this.editBackgroundCheckForm.patchValue({
                     BackLicanceImage: res.file_url,
                 });
                 this.backLicanceImage = res.file_url;
             } else if (fileType == 'massage_certification') {
                 this.editBackgroundCheckForm.patchValue({
                     MassageCertification: res.file_url,
                 });
                 this.massageCertification = res.file_url;
             } else if (fileType == 'massage_insurance') {
                 this.editBackgroundCheckForm.patchValue({
                     MassageInsurance: res.file_url,
                 });
                 this.massageInsurance = res.file_url;
             }
             this.uploadingFileType = "";
             if (!this.editBackgroundCheckForm.valid) {
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

  async onSubmit(){
if(!this.editBackgroundCheckForm.valid){
  this.isSubmit = true;
return;
}
await this.commonService.showLoader();
let payload = {
  user_id: this.logUser.id,
  license_front: this.editBackgroundCheckForm.value.FrontLicanceImage,
  license_back: this.editBackgroundCheckForm.value.BackLicanceImage,
  massage_certification: this.editBackgroundCheckForm.value.MassageCertification,
  massage_insurance: this.editBackgroundCheckForm.value.MassageInsurance,
  social_security_number: this.editBackgroundCheckForm.value.SocialSecurityNumber,
  background_check: this.editBackgroundCheckForm.value.BackgroundCheck,
  is_edit: true
  //token: this.user_detail.token
}
this.apiService.sendData("BackgroundCheckTherapist", payload).subscribe({
  next: (res: any) => {
    this.commonService.dismissLoading();
    this.responseMessage = res.message;
    this.router.navigate(['/tabs/myaccount']);
    this.commonService.presentAlert(res.message);
  }, error: (error: any) => {
    this.commonService.dismissLoading();
    this.commonService.presentAlert(error.error.message);
  }
})
  }

   removeImage(fileType: any){
    this.uploadingFileType = fileType;
    let payload = {
      user_id: this.logUser.id,
      key: fileType
    }
    this.apiService.sendData("remove-image", payload).subscribe({
      next: (res: any) => {
        if(fileType == 'license_front'){
          this.editBackgroundCheckForm.patchValue({
            FrontLicanceImage: null,
          })
          this.frontLicanceImage = null;
          } else if(fileType == 'license_back'){
            this.editBackgroundCheckForm.patchValue({
              BackLicanceImage: null,
            })
            this.backLicanceImage = null;
          } else if(fileType == 'massage_certification'){
            this.editBackgroundCheckForm.patchValue({
              MassageCertification: null,
            })
            this.massageCertification = null;
          } else if(fileType == 'massage_insurance'){
            this.editBackgroundCheckForm.patchValue({
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

}
