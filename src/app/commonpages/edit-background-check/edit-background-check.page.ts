import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-edit-background-check',
  templateUrl: './edit-background-check.page.html',
  styleUrls: ['./edit-background-check.page.scss'],
})
export class EditBackgroundCheckPage implements OnInit {

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
  file_extension_front: string = '';
  file_extension_back: string = '';
  file_extension_certification: string = ''
  file_extension_insurance: string = ''
  uploadInProgress = false;
  uploadProgress = 0;

  passwordIcon: string = 'eye-off';
  passwordType: string = 'password';
  document_file_front: any;
  document_file_back: any;
  document_file_certification: any;
  document_file_insurance: any;

  validation_messages = {
    SocialSecurityNumber: [
      { type: "required", message: "Enter social security number." },
      { type: "minlength", message: "Social security number must be exactly 9 digits." },
      { type: "maxlength", message: "Social security number must be exactly 9 digits." },
      { type: "pattern", message: "Social security number must contain only digits." }
    ],
    BackgroundCheck: [
      { type: "required", message: "Enter Background Check." },
    ]
  };

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
  ) {
    this.editBackgroundCheckForm = new FormGroup({
      SocialSecurityNumber: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
        Validators.pattern('^[0-9]*$') // Ensures only digits are allowed
      ]),
      BackgroundCheck: new FormControl("", Validators.compose([
        Validators.required,
      ])),
    });
  }

  hideShowPassword() {
    this.passwordIcon = (this.passwordIcon === 'eye') ? 'eye-off' : 'eye';
    this.passwordType = (this.passwordIcon === 'eye') ? 'text' : 'password';
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        console.log("signup user", this.logUser);
        this.getUserById(this.logUser.id);
      }
    });
  }


  async getUserById(userId: any) {
    await this.commonService.showLoader();
    this.apiService.sendData("userInfoById", { user_id: userId }).subscribe({
      next: async (res: any) => {
        if (res.data) {
          console.log('Response Data:', res.data);
          await this.commonService.dismissLoading();
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

          this.file_extension_front = this.getFileExtension(res.data.license_front);
          this.file_extension_back = this.getFileExtension(res.data.license_back);
          this.file_extension_certification = this.getFileExtension(res.data.massage_certification);
          this.file_extension_insurance = this.getFileExtension(res.data.massage_insurance);
        }
        this.backgroundcheck_details = res.data;
        this.cd.detectChanges();
      }, error: async (err: any) => {
        await this.commonService.dismissLoading();
      }
    });
  }

  getFileExtension(url: string | undefined): string {
    if (!url) {
      return '';
    }
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || '';
  }

  async presentActionSheet(fileType: any) {

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Source',
      buttons: [
        {
          text: 'Upload File',
          icon: 'document',
          handler: () => {
            FilePicker.pickFiles({}).then(async (file: any) => {
              if (file.files && file.files.length === 1) {
                const selectedFile: any = file.files[0];
                const mimeType: any = selectedFile.mimeType;
                if (mimeType === 'application/pdf' ||
                  mimeType === 'application/msword' ||
                  mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {

                  if (Capacitor.getPlatform() == 'web') {
                    let blobData = selectedFile.blob;
                    let fileName = selectedFile.name
                    if (blobData) {
                      await this.uploadFile(blobData, fileName, mimeType, fileType);
                    } else {
                      console.log('err in converting into the base64');
                    }

                  } else {
                    let fileName: any = this.commonService.getFileNameFromPath(selectedFile.path);
                    Filesystem.readFile({ path: selectedFile.path }).then(async (res) => {
                      const base64Response = await fetch(`data:application/octet-stream;base64,${res.data}`);
                      let blobData = await base64Response.blob();
                      if (blobData) {
                        await this.uploadFile(blobData, fileName, mimeType, fileType);
                      } else {
                        console.log('err in converting into the base64');
                      }
                    }).catch((err) => {
                      console.log("Filesystem error:", err);
                    });
                  }
                } else {
                  this.commonService.presentAlert("Please select a PDF or Word file.");
                }
              } else if (file.files && file.files.length > 1) {
                this.commonService.presentAlert("You can select only one file at a time.");
              } else {
                this.commonService.presentAlert("No file selected.");
              }

            }).catch((err) => {
              console.log('catch err:>', err);
            });
          }
        },
        {
          text: 'From Photos',
          icon: 'image',
          handler: async () => {
            try {
              const image = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Photos,
              });
              if (image && image.base64String) {
                let fileName = new Date().getTime() + '.' + image.format;
                const base64Response = await fetch(`data:application/octet-stream;base64,${image.base64String}`);
                const blobData = await base64Response.blob();
                await this.uploadFile(blobData, fileName, image.format, fileType);
              } else {
                this.commonService.presentAlert('Not selected image.');
              }
            } catch (error) {
              // this.commonService.presentAlert('Failed to image.');
              console.log('Failed to image.');
            }
          }
        },
        {
          text: 'Take Picture',
          icon: 'camera',
          handler: async () => {
            try {
              const image = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera,
              });
              if (image && image.base64String) {
                let fileName = new Date().getTime() + '.' + image.format;
                const base64Response = await fetch(`data:application/octet-stream;base64,${image.base64String}`);
                const blobData = await base64Response.blob();
                await this.uploadFile(blobData, fileName, image.format, fileType);
              } else {
                this.commonService.presentAlert('Not captured image.');
              }
            } catch (error) {
              // this.commonService.presentAlert('Failed to image.');
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

  // async takePicture(fileType: string) {
  //   try {
  //     const image = await Camera.getPhoto({
  //       quality: 60,
  //       allowEditing: false,
  //       resultType: CameraResultType.Base64,
  //       source: CameraSource.Prompt,
  //     });

  //     console.log('Captured image:', image);
  //     if (image && image.base64String) {

  //       this.uploadFile(image.base64String, fileType);
  //     } else {
  //       this.commonService.presentAlert('No image captured.');
  //     }
  //     this.cd.detectChanges();
  //   } catch (error) {
  //     console.error('Error taking picture:', error);
  //     this.commonService.presentAlert('Failed to capture image.');
  //   }
  // }

  checkInput() {
    if (!this.editBackgroundCheckForm.valid) {
      this.submitDisabled = true;
    } else {
      this.submitDisabled = false;
    }
  }

  // async uploadFile(file: any, fileType: any) {

  //   const formData = new FormData();
  //   formData.append("base64_image", file);
  //   formData.append("key", fileType);
  //   formData.append("fileType", fileType);
  //   formData.append("user_id", this.logUser.id);

  //   await this.commonService.showLoader("Please wait...");
  //   this.http.post(environment.SITE_URL + "api/v1/auth/upload-image", formData).subscribe(async (res: any) => {
  //     console.log("resUploaded:", res);

  //     switch (fileType) {
  //       case 'license_front':
  //         this.frontLicanceImage = res.file_url;
  //         console.log('frontLicanceImage', this.frontLicanceImage);

  //         this.file_extension_front = this.getFileExtension(res.file_url);
  //         break;
  //       case 'license_back':
  //         this.backLicanceImage = res.file_url;
  //         this.file_extension_back = this.getFileExtension(res.file_url);
  //         break;
  //       case 'massage_certification':
  //         this.massageCertification = res.file_url;
  //         this.file_extension_certification = this.getFileExtension(res.file_url);
  //         break;
  //       case 'massage_insurance':
  //         this.massageInsurance = res.file_url;
  //         this.file_extension_insurance = this.getFileExtension(res.file_url);
  //         break;
  //     }

  //     this.cd.detectChanges();
  //     await this.commonService.dismissLoading();
  //   }, async (err: any) => {
  //     console.log("err :", err);
  //     await this.commonService.dismissLoading();
  //     this.commonService.presentAlert(err.error.message);
  //   });
  // }

  async uploadFile(blobData: Blob, fileName: any, fileType: string, type: string) {
    const formData = new FormData();
    formData.append("base64_image", blobData, fileName);
    formData.append("key", type);
    formData.append("fileType", type);
    formData.append("user_id", this.logUser.id);

    await this.commonService.showLoader("Please wait...");
    this.http.post(environment.SITE_URL + "api/v1/auth/upload-image", formData).subscribe(async (res: any) => {
      console.log("resUploaded:", res);
      switch (type) {
        case 'license_front':
          this.frontLicanceImage = res.file_url;
          console.log('frontLicanceImage', this.frontLicanceImage);
          this.file_extension_front = this.getFileExtension(res.file_url);
          break;
        case 'license_back':
          this.backLicanceImage = res.file_url;
          this.file_extension_back = this.getFileExtension(res.file_url);
          break;
        case 'massage_certification':
          this.massageCertification = res.file_url;
          this.file_extension_certification = this.getFileExtension(res.file_url);
          break;
        case 'massage_insurance':
          this.massageInsurance = res.file_url;
          this.file_extension_insurance = this.getFileExtension(res.file_url);
          break;
      }

      this.cd.detectChanges();
      await this.commonService.dismissLoading();
    }, async (err: any) => {
      console.log("err :", err);
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });
  }



  async onSubmit(data: any) {
    console.log('data', data);
    if (!this.frontLicanceImage) {
      await this.commonService.presentAlert("Please upload the driver's license front.");
      return;
    }
    if (!this.backLicanceImage) {
      await this.commonService.presentAlert("Please upload the driver's license back.");
      return;
    }
    if (!this.massageCertification) {
      await this.commonService.presentAlert("Please upload the massage certification.");
      return;
    }
    if (!this.massageInsurance) {
      await this.commonService.presentAlert("Please upload the massage insurance.");
      return;
    }
    await this.commonService.showLoader();
    let payload = {
      user_id: this.logUser.id,
      license_front: this.frontLicanceImage,
      license_back: this.backLicanceImage,
      massage_certification: this.massageCertification,
      massage_insurance: this.massageInsurance,
      social_security_number: this.editBackgroundCheckForm.value.SocialSecurityNumber,
      background_check: this.editBackgroundCheckForm.value.BackgroundCheck,
      is_edit: true
      //token: this.user_detail.token
    }

    this.apiService.sendData("BackgroundCheckTherapist", payload).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        this.responseMessage = res.message;
        this.navCtrl.back();
        this.commonService.presentAlert(res.message);
      }, error: (error: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(error.error.message);
      }
    })
  }

  async removeImage(fileType: any) {
    this.uploadingFileType = fileType;
    let payload = {
      user_id: this.logUser.id,
      key: fileType
    }
    await this.commonService.showLoader("Please wait...");
    this.apiService.sendData("remove-image", payload).subscribe({
      next: (res: any) => {
        this.commonService.dismissLoading();
        if (fileType == 'license_front') {
          this.editBackgroundCheckForm.patchValue({
            FrontLicanceImage: null,
          })
          this.frontLicanceImage = null;
        } else if (fileType == 'license_back') {
          this.editBackgroundCheckForm.patchValue({
            BackLicanceImage: null,
          })
          this.backLicanceImage = null;
        } else if (fileType == 'massage_certification') {
          this.editBackgroundCheckForm.patchValue({
            MassageCertification: null,
          })
          this.massageCertification = null;
        } else if (fileType == 'massage_insurance') {
          this.editBackgroundCheckForm.patchValue({
            MassageInsurance: null,
          })
          this.massageInsurance = null;
        }
        this.uploadingFileType = "";
        this.checkInput();
      }, error: (error: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(error.error.message);
      }
    })
  }

}
