import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-add-licensure-and-credentials',
  templateUrl: './add-licensure-and-credentials.page.html',
  styleUrls: ['./add-licensure-and-credentials.page.scss'],
})
export class AddLicensureAndCredentialsPage implements OnInit {

  licensureAndCredentialsForm!: FormGroup;
  validation_messages = {
    message: [
      { type: "required", message: "Message is required." }
    ],
    // speciality_id: [
    //   { type: "required", message: "Message is required." }
    // ],
    speciality: [
      { type: "required", message: "Speciality is required." }
    ]
  };
  specialityData: any;
  loginUser: any;
  document_file: any;
  file_extension: any;
  editData: any;
  id = 0;
  helptext: any;
  is_content: boolean = false;
  licensureCredentialsData: any;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router,
    private commonService: CommonService,
    private http: HttpClient,
    private cdref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    this.licensureAndCredentialsForm = new FormGroup({
      message: new FormControl("",),
      // speciality_id: new FormControl("", Validators.compose([
      //   Validators.required,
      // ])),
      speciality: new FormControl("", Validators.compose([
        Validators.required,
      ])),
    });
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'licensure_credentials');
    }

    this.route.queryParams.subscribe((param: any) => {
      if (param.data) {
        this.editData = JSON.parse(param.data);
        this.id = this.editData.id;
        console.log("editData :", this.editData);
        this.licensureAndCredentialsForm.controls['speciality'].setValue(this.editData?.speciality);
        this.licensureAndCredentialsForm.controls['message'].setValue(this.editData?.message);
        this.document_file = this.editData.document;
        if(this.document_file){
          this.file_extension = this.editData?.document.split('.').pop();
        }
      }
    });

    this.licensureAndCredentialsForm.get('message')?.valueChanges.subscribe(value => {
      const formatted = this.capitalizeSentences(value);
      if (value !== formatted) {
        this.licensureAndCredentialsForm.get('message')?.setValue(formatted, { emitEvent: false });
      }
    });
  }

  capitalizeSentences(text: string): string {
    return text
      ?.split(/([.!?]\s*)/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.loginUser = user;
        // this.getSpeciality();
      }
    });
    this.showPrivacyPolicy();
  }

  showPrivacyPolicy() {
    this.is_content = true;
    this.apiService.get('pages').subscribe({
      next: (res: any) => {
        this.is_content = false;
        if (res.data && res.data.length > 0) {
          const privacyPage = res.data.find((page: any) => page.slug === 'add-licensure-credentials');
          this.licensureCredentialsData = privacyPage ? privacyPage.content : null;
        } else {
          this.licensureCredentialsData = null;
        }
      },
      error: (err: any) => {
        this.is_content = false;
        this.licensureCredentialsData = null;
      }

    });
  }

  getSpeciality() {
    this.apiService.fetchData(`get-specialities`, this.loginUser.token).subscribe((res: any) => {
      console.log('res', res);
      // this.specialityData = res.specialities.data;
      this.specialityData = res.specialities?.data || [];
      // if(this.editData.speciality_id){
      //   this.licensureAndCredentialsForm.controls['speciality_id'].setValue(parseInt(this.editData.speciality_id));
      // }
      if (this.editData?.speciality_id) {
        this.licensureAndCredentialsForm.controls['speciality_id'].setValue(parseInt(this.editData.speciality_id));
      }

    }, (err: any) => {
      console.log('err', err);
      this.commonService.presentAlert(err.error.message);
    })
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Source',
      buttons: [
        {
          text: 'Upload File',
          icon: 'document',
          handler: async () => {
            FilePicker.pickFiles().then(async (file: any) => {
              if (file.files && file.files.length === 1) {
                const selectedFile = file.files[0];
                const mimeType = selectedFile.mimeType;
                if (mimeType === 'application/pdf' ||
                  mimeType === 'application/msword' ||
                  mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                  console.log('valid file');
                  if (Capacitor.getPlatform() == 'web') {
                    let blobData = selectedFile.blob;
                    let fileName = selectedFile.name
                    if (blobData) {
                      await this.uploadFile(blobData, fileName, mimeType);
                    } else {
                      console.log('err in converting into the base64');
                    }
                  } else {
                    let fileName: any = this.commonService.getFileNameFromPath(selectedFile.path);
                    Filesystem.readFile({ path: selectedFile.path }).then(async (res) => {
                      const base64Response = await fetch(`data:application/octet-stream;base64,${res.data}`);
                      let blobData = await base64Response.blob();
                      if (blobData) {
                        await this.uploadFile(blobData, fileName, mimeType);
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
              console.log("FilePicker error:", err);
            });
          }
        },
        // {
        //   text: 'Take Picture',
        //   icon: 'camera',
        //   handler: async () => {
        //     const image: any = await Camera.getPhoto({
        //       quality: 60,
        //       allowEditing: false,
        //       resultType: CameraResultType.Base64,
        //       source: CameraSource.Prompt,
        //     });
        //     this.uploadFile(image.base64String, image.formate);
        //   }
        // },
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
                await this.uploadFile(blobData, fileName, image.format);
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
                await this.uploadFile(blobData, fileName, image.format);
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

  async onSubmit(form_data: any) {
    // if (!this.document_file) {
    //   this.commonService.presentAlert("Please upload the document.");
    //   return;
    // }
    await this.commonService.showLoader();
    form_data.token = this.loginUser.token;
    form_data.document = this.document_file;
    form_data.id = this.id;
    this.apiService.send1("add_licensure", form_data, this.loginUser.token).subscribe({
      next: async (res: any) => {
        console.log('res', res);
        await this.commonService.dismissLoading();
        this.commonService.presentAlert(res.message);
        this.id = 0;
        this.document_file = null;
        // this.router.navigate(['/profile']);
        this.navCtrl.back();
        this.licensureAndCredentialsForm.reset();
      }, error: async (err: any) => {
        await this.commonService.dismissLoading();
        this.commonService.presentAlert(err.error.message);
      }
    });
  }

  async uploadFile(blobData: any, fileName: any, fileType: any) {
    const formData = new FormData();
    formData.append("base64_image", blobData, fileName);
    formData.append("key", 'document');
    formData.append("fileType", fileType);
    formData.append("user_id", this.loginUser.id);
    await this.commonService.showLoader("Please wait..");
    this.http.post(environment.SITE_URL + "api/v1/auth/upload-image", formData).subscribe(async (res: any) => {
      console.log("res:", res);
      this.document_file = res.file_url;
      this.file_extension = this.document_file.split('.').pop();
      console.log("file_extension :", this.file_extension);
      this.cdref.detectChanges();
      console.log("document_file :", this.document_file);
      await this.commonService.dismissLoading();
    }, async (err: any) => {
      console.log("err :", err);
      await this.commonService.dismissLoading();
      this.commonService.presentAlert(err.error.message);
    });
  }

  async deleteCertificate() {
    let payload: any = {
      token: this.loginUser.token,
      image_url: this.document_file,
    }
    await this.commonService.showLoader("Please wait...");
    this.apiService.send1("delete-document", payload, this.loginUser.token).subscribe(async (res: any) => {
      await this.commonService.dismissLoading();
      this.document_file = null;
    }, async (err) => {
      console.log("err :", err);
      this.document_file = null;
      await this.commonService.dismissLoading();
    });
  }


}
