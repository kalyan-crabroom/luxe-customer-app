import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { InAppBrowser } from '@capgo/inappbrowser';

@Component({
  selector: 'app-background-check',
  templateUrl: './background-check.page.html',
  styleUrls: ['./background-check.page.scss'],
})
export class BackgroundCheckPage implements OnInit {

  user_detail: any
  fileUrl: any;
  frontLicanceImage: any;
  backLicanceImage: any;
  backgroundCheckForm!: FormGroup;
  massageCertification: any;
  massageInsurance: any;
  isSubmit: boolean = true;
  uploadingFileType: any = "";
  isModalOpen: boolean = false;
  responseMessage: string = '';
  submitDisabled: boolean = true;
  background_check: any;
  uploadInProgress = false;
  uploadProgress = 0;
  passwordIcon: string = 'eye-off';
  passwordType: string = 'password';
  document_file: any;
  file_extension: any;
  document_file_front: any;
  document_file_back: any;
  document_file_certification: any;
  document_file_insurance: any;
  file_extension_front: any;
  file_extension_back: any;
  file_extension_certification: any;
  file_extension_insurance: any;

  validation_messages = {
    SocialSecurityNumber: [
      { type: "required", message: "Enter social security number." },
      { type: "minlength", message: "Social security number must be exactly 9 digits." },
      { type: "maxlength", message: "Social security number must be exactly 9 digits." },
      { type: "pattern", message: "Social security number must contain only digits." }
    ],
    BackgroundCheck: [
      { type: "required", message: "Enter Background Check." },
    ],
    gender: [
      { type: "required", message: "Gender is required." },
    ]
  };

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private navCtrl: NavController,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
  ) {
    this.backgroundCheckForm = new FormGroup({
      // SocialSecurityNumber: new FormControl('', [
      //   Validators.required,
      //   Validators.minLength(9),
      //   Validators.maxLength(9),
      //   Validators.pattern('^[0-9]*$') // Ensures only digits are allowed
      // ]),
      BackgroundCheck: new FormControl("", Validators.compose([
        Validators.required,
      ])),
      gender: new FormControl("",Validators.required),
      // licenseFront: new FormControl(null, Validators.required),
      // licenseBack: new FormControl(null, Validators.required),
      // massageCertification: new FormControl(null, Validators.required),
      // massageInsurance: new FormControl(null, Validators.required),
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.user_detail = navigation.extras.state['user_detail'];
      console.log("user_detail :", this.user_detail);
    }

  }

  ngOnInit() {

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

  async uploadFile(blobData: Blob, fileName: any, fileType: string, type: string) {
    const formData = new FormData();
    formData.append("base64_image", blobData, fileName);
    formData.append("key", type);
    formData.append("fileType", type);
    formData.append("user_id", this.user_detail.id);

    await this.commonService.showLoader("Please wait...");
    this.http.post(environment.SITE_URL + "api/v1/auth/upload-image", formData).subscribe(async (res: any) => {
      switch (type) {
        case 'license_front':
          this.document_file_front = res.file_url;
          this.file_extension_front = this.document_file_front.split('.').pop();
          break;
        case 'license_back':
          this.document_file_back = res.file_url;
          this.file_extension_back = this.document_file_back.split('.').pop();
          break;
        case 'massage_certification':
          this.document_file_certification = res.file_url;
          this.file_extension_certification = this.document_file_certification.split('.').pop();
          break;
        case 'massage_insurance':
          this.document_file_insurance = res.file_url;
          this.file_extension_insurance = this.document_file_insurance.split('.').pop();
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
    if (!this.document_file_front) {
      await this.commonService.presentAlert("Please upload the driver's license front.");
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
      license_front: this.document_file_front,
      license_back: this.document_file_back,
      massage_certification: this.document_file_certification,
      massage_insurance: this.document_file_insurance,
      // social_security_number: this.backgroundCheckForm.value.SocialSecurityNumber,
      background_check: this.backgroundCheckForm.value.BackgroundCheck, 
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

  async removeImage(fileType: any) {

    this.uploadingFileType = fileType;
    let payload = {
      user_id: this.user_detail.id,
      key: fileType
    }
    console.log('payload', payload);
    await this.commonService.showLoader("Please wait...");
    this.apiService.sendData("remove-image", payload).subscribe({
      next: (res: any) => {
        console.log('resrem', res);
        this.commonService.dismissLoading();
        switch (fileType) {
          case 'license_front':
            this.document_file_front = null;
            break;
          case 'license_back':
            this.document_file_back = null;
            break;
          case 'massage_certification':
            this.document_file_certification = null;
            break;
          case 'massage_insurance':
            this.document_file_insurance = null;
            break;
          default:
            console.error('Unknown image type');
        }
      }, error: (error: any) => {
        this.commonService.dismissLoading();
        this.commonService.presentAlert(error.error.message);
      }
    })
  }

  async goToLogin() {
    this.openOnboardLink();
    setTimeout(() => {
      this.isModalOpen = false;
      this.cd.detectChanges();
      this.navCtrl.navigateRoot(['/login']);
    }, 1000);

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
        this.storageService.saveToStorage('deeplyCalm:therapist', res.data.user);
        this.commonService.presentToast('Login Successfully', 'success');
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
  };

  hideShowPassword() {
    this.passwordIcon = (this.passwordIcon === 'eye') ? 'eye-off' : 'eye';
    this.passwordType = (this.passwordIcon === 'eye') ? 'text' : 'password';
    this.cd.detectChanges();
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


