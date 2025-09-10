import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-treatment-modal',
  templateUrl: './treatment-modal.page.html',
  styleUrls: ['./treatment-modal.page.scss'],
})
export class TreatmentModalPage implements OnInit {
  logUser: any;
  treatmentData: any = [];
  selectedTreatment: any = this.navParams.get('selectedTreatment');
  index:any = this.navParams.get('index');
  ready: boolean = false;
  isModalOpen: boolean = false;
  showFullDescription: any
  showValue: any = []
  selectedTreatmentParams: any;
  searchQuery: any = '';
  bookingData: any = {};
  expandedDescriptions: { [key: string]: boolean } = {};

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private navCtrl: NavController,
    private common: CommonService,
    public modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getTreatments();
      }
    });
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('bookingData').then((data: any) => {
      if (data) {
        this.bookingData = data;
        // if(this.bookingData.selectedTreatment){
        //   this.selectedTreatmentParams = this.bookingData.selectedTreatment;
        //   this.patchValue();
        // }
        this.selectedTreatmentParams = this.selectedTreatment;
        console.log(this.selectedTreatmentParams)
        this.patchValue();
        console.log("bookingData :", this.bookingData);
      }
    });
  }

  getTreatments() {
    this.ready = false;
    this.apiService.fetchData(`get-treatments?searchQuery=${this.searchQuery}`, this.logUser.token).subscribe({
      next: (res: any) => {
        console.log("selectedTreatmentParams :", this.selectedTreatmentParams);
        this.ready = true;
        this.treatmentData = res.treatments;
        if (this.selectedTreatmentParams) {
          this.patchValue();
        }
      },
      error: (err: any) => {
        this.ready = true;
        if (err.error.error_code == 'token_expired') {
          this.storageService.removeFromStorage('deeplyCalm:user');
          this.navCtrl.navigateRoot(['/login']);
        }
        this.common.presentToast(err.error.message, 'danger');
        console.log('err', err);
      }
    });
  }

  patchValue() {
    if (this.selectedTreatmentParams) {
      this.selectedTreatment = this.treatmentData.find((treatment: any) => treatment.id == this.selectedTreatmentParams.id);
    }
  }

  // toggleDescription(item: any) {
  //   this.showFullDescription = !this.showFullDescription;
  //   if (!this.showFullDescription) {
  //     this.selectedTreatment = null;
  //   } else {
  //     this.selectedTreatment = item;
  //   }
  // }
  toggleDescription(itemId: string) {
    this.expandedDescriptions[itemId] = !this.expandedDescriptions[itemId];
  }

  selectTreatment(treatment: any) {
    this.selectedTreatment = treatment;
  }

  openModel(id: any) {
    const item = this.treatmentData.find((treatment: any) => treatment.id === id);
    if (item) {
      this.selectedTreatment = item;
      this.showValue = item.price_and_durations;
      this.isModalOpen = true;
    }
  }

  closeModel() {
    this.isModalOpen = false;
  }

  async submitSelection() {
    if (this.selectedTreatment) {
      // this.bookingData.selectedTreatment = this.selectedTreatment;
      // await this.storageService.saveToStorage('bookingData',this.bookingData);
      // this.navCtrl.navigateBack(['/book-now-first-time-client']);
      await this.modalController.dismiss({ status: 'ok', selectedTreatment: this.selectedTreatment,index : this.index });
    }
  }

  async dismissModal() {
    await this.modalController.dismiss({ status: 'cancel', selectedTreatment: null });
  }

  handleInput(event: any) {
    this.searchQuery = event.target.value;
    this.getTreatments();
  }

  clear() {
    this.searchQuery = '';
    this.getTreatments();
  }


}
