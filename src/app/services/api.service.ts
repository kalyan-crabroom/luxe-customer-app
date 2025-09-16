import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  location_refresh: BehaviorSubject<any> = new BehaviorSubject(null);
  loading: any;
  loginUser: any;
  appSettingDetails: any = new BehaviorSubject([]);
  helperTexts: any = [];
  geoNamesUsername: any = 'knoxweb';
  geoApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  timezoneApiUrl = 'https://maps.googleapis.com/maps/api/timezone/json';

  constructor(
    public http: HttpClient,
    public toastCtrl: ToastController,
    public storage: StorageService
  ) {
    this.storage.getFromStorage('deeplyCalm:user').then((user) => {
      if (user) {
        this.loginUser = user;
      }
    });
  }

  sendData(endPoint: any, payload: any) {
    let httpOptions = {};
    if (payload.token) {
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + payload.token
        })
      };
    }

    // Log API request
    console.log('🌐 API Request:', {
      method: 'POST',
      url: `${environment.API_URL}${endPoint}`,
      payload: payload,
      headers: httpOptions
    });

    return this.http.post(`${environment.API_URL}${endPoint}`, payload, httpOptions).pipe(
      map((data: any) => {
        // Log API response
        console.log('✅ API Response:', {
          url: `${environment.API_URL}${endPoint}`,
          data: data
        });
        return data;
      })
    );
  }

  send(endPoint: any, payload: any) {
    let httpOptions = {};
    if (payload.token) {
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + payload.token
        })
      };
    }
    return this.http.post(`${environment.API_URL2}${endPoint}`, payload, httpOptions).pipe(map((data: any) => { return data; }));
  }

  send1(endPoint: any, payload: FormData, token: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post(`${environment.API_URL2}${endPoint}`, payload, { headers }).pipe(
      map(data => data)
    );
  }

  get(endpoints: any) {
    return this.http.get(`${environment.API_URL2}` + endpoints);
  }

  doLogin(data: any) {
    return this.http.post(`${environment.SITE_URL}api/v1/auth/signIn`, data)
  }

  fetchData(endPoint: any, token: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };
    return this.http.get(`${environment.API_URL2}` + endPoint, httpOptions).pipe(map((result: any) => result));
  }

  getUsersList(payload: any, token: any) {
    let httpOptions = {};
    if (token) {
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    }
    return this.http.post(`${environment.API_URL2}getUserInfoByIds`, payload, httpOptions).pipe(map((data: any) => { return data; }));
  }

  getSaveCards(payload: any, token: any) {
    let httpOptions = {};
    if (token) {
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    }
    return this.http.post(`${environment.API_URL2}getsavecard`, payload, httpOptions).pipe(map((data: any) => { return data; }));
  }

  deleteCard(payload: any, token: any) {
    return this.http.post(`${environment.API_URL2}deletecard`, payload).pipe(map((data: any) => { return data; }));
  }

  getLocation() {
    return this.http.get('https://ipinfo.io/json');
  }

  getAppSettings(token: any) {
    return new Promise((resolve, reject) => {
      this.fetchData('getAppSetting', token).subscribe((res) => {
        this.appSettingDetails.next(res.data);
        resolve(true);
      }, (err: any) => {
        reject(false);
      });
    });
  }

  getTimezoneFromZip(zipCode: string): Observable<any> {
    const postalCodeUrl = `http://api.geonames.org/postalCodeSearchJSON?postalcode=${zipCode}&maxRows=1&username=${this.geoNamesUsername}`;
    return this.http.get(postalCodeUrl).pipe(
      switchMap((response: any) => {
        if (response && response.postalCodes && response.postalCodes.length > 0) {
          const latitude = response.postalCodes[0].lat;
          const longitude = response.postalCodes[0].lng;
          const timezoneUrl = `http://api.geonames.org/timezoneJSON?lat=${latitude}&lng=${longitude}&username=${this.geoNamesUsername}`;
          return this.http.get(timezoneUrl);
        } else {
          return of({ status: false, message: 'Timezone not found for this zip code' });
        }
      })
    );
  }

  getDeviceTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }


  getTimezoneByZip(zipcode: string): Observable<any> {
    const geoApiUrlWithParams = `${this.geoApiUrl}?address=${zipcode}&key=AIzaSyB-3a7E9u6sbb5GexwjlNYT7PN7GcHnXrI`;
    return this.http.get<any>(geoApiUrlWithParams).pipe(
      switchMap((geocodeData: any) => {
        console.log("geocodeData :", geocodeData);
        const lat = geocodeData.results[0].geometry.location.lat;
        const lng = geocodeData.results[0].geometry.location.lng;

        const timestamp = Math.floor(Date.now() / 1000); // current time in seconds
        const timezoneApiUrlWithParams = `${this.timezoneApiUrl}?location=${lat},${lng}&timestamp=${timestamp}&key=AIzaSyB-3a7E9u6sbb5GexwjlNYT7PN7GcHnXrI`;

        return this.http.get<any>(timezoneApiUrlWithParams);
      })
    );
  }


}
