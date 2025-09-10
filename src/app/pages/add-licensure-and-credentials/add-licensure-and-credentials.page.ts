import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-add-licensure-and-credentials',
  templateUrl: './add-licensure-and-credentials.page.html',
  styleUrls: ['./add-licensure-and-credentials.page.scss'],
})
export class AddLicensureAndCredentialsPage implements OnInit {

licensureAndCredentialsForm!: FormGroup;
isSubmit: boolean = true;
document_file: any;
fileUrl: any;
logUser: any;
speciality_list = [
  {label: "speciality 1"},
  {label: "speciality 2"},
  {label: "other"},
];
ifSpecialtyIsOther: boolean = false;
requiredCustomeSpecialty: boolean = false;

  constructor(
    private fb: FormBuilder,
    private actionSheetCtrl: ActionSheetController,
    private storageService: StorageService,
    private apiService: ApiService,
    private alertCtrl : AlertController,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
      }
    });

    this.licensureAndCredentialsForm = this.fb.group({
      specialty: ['', Validators.required],
      custome_Speciality: [''],
      documents: ['', Validators.required],
      message: ['', Validators.required]
    })
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Source',
      buttons: [
        {
          text: 'Upload File',
          icon: 'document',
          handler: () => {
           document.getElementById("document_file")?.click();
          }
        },
        {
          text: 'Take Picture',
          icon: 'camera',
          handler: () => {
            //this.takePicture(fileType);
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

  uploadDocFile(event: any): void {
    const file: File = event.target.files[0];
    this.document_file = file;
    if (file && file.type.startsWith('image')) {
      // this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = async () => {
        this.fileUrl = reader.result as string;
        console.log("uploaded file", this.fileUrl);
        //this.uploadFile(file, imageType);
        
      }
       reader.readAsDataURL(file);
      
    } else {
      this.document_file = "";
      //alert('Please select an image file.');
    }
  }

  handelSpecialty(event: any){
    if(event.target.value == 'other'){
    this.ifSpecialtyIsOther = true;
    } else {
    this.ifSpecialtyIsOther = false;
    }
  }

  onSubmit(){
    if(this.ifSpecialtyIsOther && !this.licensureAndCredentialsForm.value.custome_Speciality){
    this.requiredCustomeSpecialty = true;
      return;
    }
    if(!this.licensureAndCredentialsForm.valid){
      this.isSubmit = false;
    return;
    }
    this.commonService.showLoader();
    let formdata = new FormData();
    formdata.append("therapist_id", this.logUser.id);
    formdata.append("speciality", this.licensureAndCredentialsForm.value.specialty);
    formdata.append("custom_speciality", this.licensureAndCredentialsForm.value.custome_Speciality)
    formdata.append("document", this.document_file);
    formdata.append("message", this.licensureAndCredentialsForm.value.message);
    this.apiService.send("add_licensure", formdata).subscribe({
      next: (res: any) => {
        this.licensureAndCredentialsForm.reset();
        this.commonService.dismissLoading();
      this.presentAlert();
      }, error: (err: any) => {
        this.commonService.dismissLoading();
      }
    })
  }

  async presentAlert(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        
        header: '<ion-icon name="checkmark-circle-outline"></ion-icon>',
        subHeader: "Licensure added",
        message: "Would you want to add more documents",
        buttons: [{
          text: 'Yes',
          handler: () => {
            resolve(true);
          }
        },{
          text: 'No',
          handler: () => {
            this.router.navigate(['/tabs/myaccount']);
            resolve(true);
          }
        }
        ]
      });
      await alert.present();
    })
  }

}
