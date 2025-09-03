import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-book-now',
  templateUrl: './book-now.page.html',
  styleUrls: ['./book-now.page.scss'],
})
export class BookNowPage implements OnInit {
  selectedCard: any;
  selectedPeople: any = 1;
  selectedSegmentValue: any;
  backToBackChecked: boolean = false;
  navCtrl: any;
  selectedGender: any
  therapist_id: any
  therapist_data: any
  helptext: any;
  isActiveCouple: boolean = true;
  isActiveBackToBack: boolean = false;
  bookingData: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private storage: StorageService,
    private cdref: ChangeDetectorRef
  ) {
    if (this.commonService.helptext.length > 0) {
      this.helptext = this.commonService.helptext.find((res: any) => res.page_name == 'book_now1');
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params.therapist_data) {
        this.therapist_data = JSON.parse(params.therapist_data)
        console.log('  this.therapist_data ', this.therapist_data)
        this.therapist_id = this.therapist_data.id
      }
    })
  }

  ionViewWillEnter() {
    this.storage.getFromStorage('bookingData').then((data: any) => {

      if (data) {
        this.bookingData = data;
        if (this.bookingData.isActiveCouple) {
          this.isActiveCouple = this.bookingData.isActiveCouple;
        }

        if (this.bookingData.selectedPeople.how_many_people) {
          this.selectedPeople = this.bookingData.selectedPeople.how_many_people;
          this.cdref.detectChanges();
        }

        if (this.bookingData.selectedPeople.back_to_back_session) {
          this.backToBackChecked = this.bookingData.selectedPeople.back_to_back_session;
          this.isActiveBackToBack = true;
          this.isActiveCouple = false;
        }

        if (this.bookingData.therapist_id) {
          this.bookingData.therapist_id = this.therapist_id;
          this.bookingData.therapist_data = this.therapist_data;
        }
        console.log("bookingData :", this.bookingData);
        this.cdref.detectChanges();
      }
    });
  }

  onSubmit(form: any) {
    console.log('form1', form);
  }

  selectPeople(selectedValue: number) {
    this.selectedPeople = selectedValue;
    console.log(this.selectedPeople)
  }

  async gotoNext() {
    if (this.selectedPeople === 1) {
      this.bookingData.isActiveCouple = false;//this.isActiveCouple;
      this.bookingData.selectedPeople = {
        cardType: 'Single',
        how_many_people: this.selectedPeople,
        back_to_back_session: false
      }

    } else if (this.selectedPeople === 2) {
      this.isActiveCouple = false;
      this.bookingData.isActiveCouple = this.isActiveCouple;
      // this.bookingData.isActiveCouple = this.isActiveCouple;
      this.bookingData.selectedPeople = {
        cardType: this.isActiveCouple ? 'Couples' : 'Back-to-back',
        how_many_people: this.selectedPeople,
        back_to_back_session: true,
        // back_to_back_session: this.backToBackChecked,
        description: 'Two therapists for two people at the same time.',
        backToBack: "One therapist for two people one after another.",
      }

    } else if (this.selectedPeople === 3) {
      this.bookingData.isActiveCouple = false;//this.isActiveCouple;
      this.bookingData.selectedPeople = {
        cardType: 'Back-to-back',
        how_many_people: this.selectedPeople,
        back_to_back_session: true,
      }
    } else if (this.selectedPeople === 4) {

      this.bookingData.isActiveCouple = false;//this.isActiveCouple;
      this.bookingData.selectedPeople = {
        cardType: 'Back-to-back',
        how_many_people: this.selectedPeople,
        back_to_back_session: true,
      }
    }
    if (this.therapist_id) {
      this.bookingData.therapist_id = this.therapist_id;
      this.bookingData.therapist_data = this.therapist_data;
    }
    await this.storage.saveToStorage('bookingData', this.bookingData);
    this.router.navigate(['/book-now-first-time-client']);
  }

  selectType(type: string) {
    if (type == 'Couples') {
      this.isActiveCouple = true;
      this.isActiveBackToBack = false;
      // this.backToBackChecked = false;
    }
    if (type == 'Back-to-back') {
      this.isActiveCouple = false;
      this.isActiveBackToBack = true;
      // this.backToBackChecked = true;
    }
  }

  // changeBackToBack(event: any) {
  //   let isChecked = event.target.checked;
  //   if (isChecked) {
  //     this.isActiveCouple = false;
  //     this.isActiveBackToBack = true;
  //     this.backToBackChecked = !this.backToBackChecked;
  //   } else {
  //     this.isActiveBackToBack = false;
  //     this.backToBackChecked = !this.backToBackChecked;
  //   }
  // }
}
