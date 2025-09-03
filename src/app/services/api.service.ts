import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  appSettingDetails: any = new BehaviorSubject([]);

  constructor(
    public http: HttpClient
  ) { }

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
    return this.http.post(`${environment.API_URL}${endPoint}`, payload, httpOptions).pipe(map(data => { return data; }));
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
    return this.http.post(`${environment.API_URL2}${endPoint}`, payload, httpOptions).pipe(map(data => { return data; }));
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
    return this.http.get(`${environment.API_URL2}` + endPoint, httpOptions).pipe(map((result) => result));
  }

  uploadbackgroundCheckImage(endPoint: any, payload: FormData) {
    return this.http.post(`${environment.API_URL}${endPoint}`, payload).pipe(map(data => { return data; }));
  }

  getLatLngFromZip(zipCode: string) {
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${environment.googleApiKey}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&components=country:US&key=${environment.googleApiKey}`;
    return this.http.get<any>(url);
  }

  getAppSettings(token: any) {
    return new Promise((resolve, reject) => {
      this.fetchData('getAppSetting', token).subscribe((res: any) => {
        this.appSettingDetails.next(res.data);
        resolve(true);
      }, (err: any) => {
        reject(false);
      });
    });
  }
}
