import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {

  is_treatment: boolean = false;
  treatmentData: any;
  loginUser: any;
  gender: any;
  radius: any = '50';
  selectedCheckbox:any = [];

  constructor(
    public modal: ModalController,
    public apiService: ApiService,
    public common: CommonService,
    public storageService: StorageService
  ) {
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.loginUser = user;
        this.getTreatments();
      }
    });
  }

  ngOnInit() {
  }

  modalClose() {
    this.modal.dismiss({ status: 'close' });
  }

  applyFilter() {
    this.modal.dismiss({ status: 'ok', gender: this.gender, radius: this.radius,selectedCheckbox : this.selectedCheckbox });
  }

  getTreatments() {
    this.is_treatment = true;
    this.apiService.fetchData(`get-treatments`, this.loginUser.token).subscribe((res: any) => {
      this.is_treatment = false;
      this.treatmentData = res.treatments;
      this.treatmentData.forEach((element:any) => {
        let index = this.selectedCheckbox.indexOf(element.id);
        if(index === -1){
          element.checked = false;
        }else{
          element.checked = true;
        }
      });
    }, (err) => {
      console.log("error :", err);
      this.is_treatment = false;
    });
  }

  selectCheckbox(item:any){
    let index = this.selectedCheckbox.indexOf(item.id);
    if(index === -1){
      this.selectedCheckbox.push(item.id);
    }else{
      this.selectedCheckbox.splice(index,1);
    }        
  }

  clear(){
    this.modal.dismiss({ status: 'ok', gender: undefined, radius: '50' ,selectedCheckbox : [this.selectedCheckbox] });
  }


}
