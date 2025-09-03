import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.page.html',
  styleUrls: ['./payment-information.page.scss'],
})
export class PaymentInformationPage implements OnInit {
  params: any
  logUser: any;
  // paymentMethodList: any = [];
  selectedSegment: string = 'card';
  paymentMethodList: any = { cards: [] };
  ready: boolean = false;
  is_transaction: boolean = false;
  transaction:any = []
  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.params = this.router.getCurrentNavigation()?.extras.state;
      if (this.params.segment) {
        this.selectedSegment = this.params.segment;
        console.log('selectedSegment',this.selectedSegment);
        
      }
    }
  }

  ionViewWillEnter() {
    this.storageService.getFromStorage('deeplyCalm:user').then((user: any) => {
      if (user != null) {
        this.logUser = user;
        this.getCard(this.logUser);
        this.getTransectionDetails()
      }
    });
  }

  getTransectionDetails(){
    this.is_transaction = false;
    this.apiService.fetchData('customer-transaction-history', this.logUser.token).subscribe({
      next: (res: any) => {
        console.log('resCompleted1>>', res);
        this.is_transaction = true;
        this.transaction = res.data.data;
        console.log('transaction',this.transaction);
        
      },
      error: (err: any) => {
        this.is_transaction = true;
      }
    })
  }
  
  goToBooking(item: any) {
    console.log('item',item);
    
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: item.booking_id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
    console.log('parameter',parameter)
  }


  getCard(logUser: any) {
    let body = {
      user_token: logUser.token
    };
    this.ready = false;
    this.apiService.getSaveCards(body, logUser.token).subscribe((res: any) => {
      this.ready = true;
     
      if (res.success) {
        this.paymentMethodList.cards = res.cards || [];
        this.paymentMethodList.connected_banks = res.connected_banks || [];
      } else {
        this.paymentMethodList.cards = [];
        this.paymentMethodList.connected_banks = [];
        console.log('No cards or banks found');
      }
    }, (err: any) => {
      this.ready = true;
      this.commonService.presentAlert(err?.error?.msg || 'Error fetching payment methods.');
      console.error('Error fetching cards:', err);
    });
  }

  confirmDeleteBank(index: number, bankId: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: "Delete !",
        message: "Are you sure ?",
        buttons: [
          {
            text: 'No',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.deleteBank(index, bankId);
              console.log('delete');

            }
          }
        ]
      });
      await alert.present();
    })
  }

  deleteBank(index: number, bankId: any) {
    this.commonService.showLoader();
    let payload = {
      bank_id: bankId,
      token: this.logUser.token
    }
    this.apiService.send('deleteBank', payload).subscribe({
      next:(res:any)=>{
        console.log('res22',res);
        this.commonService.dismissLoading();
        if (res.success) {
          this.paymentMethodList.connected_banks.splice(index, 1);
          this.commonService.presentToast(res.message, "success");
        } else {
          this.commonService.presentToast(res.message, "danger");
        }
      },error:(err:any)=>{
        this.commonService.dismissLoading();
        if (err?.error?.message) {
          this.commonService.presentAlert(err?.error?.message);
        } else {
          this.commonService.presentAlert("Your card information could not be verified.");
        }
      }
    })
  }
  confirmDeleteAlert(index: number, cardId: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: "Delete !",
        message: "Are you sure ?",
        buttons: [
          {
            text: 'No',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.deleteCard(index, cardId);
            }
          }
        ]
      });
      await alert.present();
    })
  }

  deleteCard(index: number, cardId: any) {
    this.commonService.showLoader();
    let payload = {
      card_id: cardId
    }
    this.apiService.deleteCard(payload, this.logUser.token).subscribe({
      next:(res:any)=>{
        this.commonService.dismissLoading();
        if (res.success) {
          this.paymentMethodList.cards.splice(index, 1);
          this.commonService.presentToast(res.message, "success");
        } else {
          this.commonService.presentToast(res.message, "danger");
        }
      },error:(err:any)=>{
        this.commonService.dismissLoading();
        if (err?.error?.message) {
          this.commonService.presentAlert(err?.error?.message);
        } else {
          this.commonService.presentAlert("Your card information could not be verified.");
        }
      }
    })
  }

  add(type: any) {
    this.router.navigate(['/add-debit-card'], { state: { type: type, status: this.params?.type, segment: this.selectedSegment } });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  goToEditCard(data:any){
    console.log("data :",data); 
    let navData : NavigationExtras = {
      queryParams:{
        card_details : JSON.stringify(data)
      }
    }
    this.router.navigate(['edit-card'],navData);
  } 

}
