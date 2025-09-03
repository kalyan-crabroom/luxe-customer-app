import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  refresh_storage :BehaviorSubject<any>= new BehaviorSubject(null);
  
  constructor() { }
  async saveToStorage(key: any, value: any) {
    const data = await Preferences.set({
      key: key,
      value: JSON.stringify(value)
    })
  }

  async getFromStorage(key: any) {
    const data:any = await Preferences.get({ key })
    //return data;
    return JSON.parse(data.value);
  }
  
  async removeFromStorage(key: any) {
    const data = await Preferences.remove({ key })
  }
  
}
