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
        console.log('Document added with ID: ', docRef.id);
        resolve('Data added successfully');
      }).catch(error => {
        console.error('Error adding document: ', error);
        reject('Error adding data: ' + error);
      });
    });
  }

  getMessages() {
    return this.afs.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' });
  }

}
