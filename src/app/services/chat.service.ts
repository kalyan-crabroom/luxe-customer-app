import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  loading: any;

  constructor(
    private afs: AngularFirestore,
  ) { }

  sendMessage(fromId: any, message: any, toId: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.afs.collection('messages').add({
        from: fromId,
        msg: message,
        msgSenderId: fromId,
        to: toId,
        unread: 0,
        createdAt: new Date().toISOString()
      }).then(docRef => {
        console.log('message: ', docRef.id);
        resolve('Data added successfully');
      }).catch(error => {
        console.error('Error: ', error);
        reject('Error adding data: ' + error);
      });
    });
  }


  getMessages() {
    return this.afs.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' });
  }

  updateUserStatus(userId: string, status: string) {
    console.log('v12',userId);
    console.log('st12',status);
    
    return this.afs.doc(`users/${userId}`).update({
      status: status,
      lastActive: new Date().toISOString()
    }).then(() => {
      console.log(`User ${userId} status updated to ${status}`);
    }).catch(error => {
      console.error('Error updating user status: ', error);
    });
  }

  getUserStatus(userId: string) {
    console.log('getUserStatus',userId);
    
    if (typeof userId !== 'string') {
      throw new Error('Invalid userId type. Expected a string.');
    }
    return this.afs.doc(`users/${userId}`).valueChanges();
  }
  
  // Call this method to update status when user goes online
  setOnline(userId: string) {
    this.updateUserStatus(userId, 'online');
    console.log();
    
  }

  // Call this method to update status when user goes offline
  setOffline(userId: string) {
    this.updateUserStatus(userId, 'offline');
  }

}
