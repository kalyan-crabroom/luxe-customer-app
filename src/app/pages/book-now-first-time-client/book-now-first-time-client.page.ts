import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-book-now-first-time-client',
  templateUrl: './book-now-first-time-client.page.html',
  styleUrls: ['./book-now-first-time-client.page.scss'],
})
export class BookNowFirstTimeClientPage implements OnInit {
  bookFirstTime: FormGroup
  people: number = 0;
  queryParamsData: any = {};
  isEdit: Boolean = false;
  receiveData: any
  validation_messages = {
    treatment: [
      { type: 'required', message: "This Field is required." },
    ],
    therapistGender: [
      { type: 'required', message: "This Field is required." },
    ],
    duration: [
      { type: 'required', message: "This Field is required." },
    ],
    notes: [
      { type: 'required', message: "This Field is required." },
    ],
    messageFor: [
      { type: 'required', message: "This Field is required." },
    ],

  }
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookFirstTime = new FormGroup({
      treatment: new FormControl('', Validators.required),
      therapistGender: new FormControl("Any", Validators.required),
      duration: new FormControl("60Mins", Validators.required),
      messageFor: new FormControl("", Validators.required),
      notes: new FormControl("", Validators.required),
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params.formData) {
        this.receiveData = JSON.parse(params.formData);
        console.log('formFirstTime', this.receiveData);
        this.patchFormValues(this.receiveData);
        if (params.isEdit) {
          this.isEdit = true;
        }
      }
      if (params.cardType) {
        this.queryParamsData.cardType = params.cardType;
      }
      if (params.description) {
        this.queryParamsData.description = params.description;
      }
      if (params.backToBack) {
        this.queryParamsData.backToBack = params.backToBack;
      }
      if (params.therapistGender1) {
        this.queryParamsData.therapistGender1 = params.therapistGender1;
      }
    });

  }
  patchFormValues(formData: any) {
    this.bookFirstTime.patchValue({
      treatment: formData.treatment,
      therapistGender: formData.therapistGender,
      duration: formData.duration,
      messageFor: formData.messageFor,
      notes: formData.notes
    });
  }


  onSubmit(form: any) {
    console.log('form', form);
    console.log('queryParamsData', this.queryParamsData);
    if (this.isEdit) {
      let extra: NavigationExtras = {
        queryParams: {
          formData: JSON.stringify({
            ...this.receiveData,
            treatment: form.treatment,
            therapistGender: form.therapistGender,
            duration: form.duration,
            messageFor: form.messageFor,
            notes: form.notes,
          }),
          isEdit: true
        }
      }
      this.router.navigate(['/checkout'], extra);

    } else if (form.messageFor === 'Guest') {
      let extra: NavigationExtras = {
        queryParams: {
          treatment: form.treatment,
          therapistGender: form.therapistGender,
          duration: form.duration,
          messageFor: form.messageFor,
          notes: form.notes,
          ...this.queryParamsData
        }
      }
      this.router.navigate(['/guest-details'], extra);
    } else {
      let extra: NavigationExtras = {
        queryParams: {
          treatment: form.treatment,
          therapistGender: form.therapistGender,
          duration: form.duration,
          messageFor: form.messageFor,
          notes: form.notes,
          ...this.queryParamsData
        }
      }
      this.router.navigate(['/preferences'], extra);
    }
  }

}



