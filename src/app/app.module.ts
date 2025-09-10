import { CUSTOM_ELEMENTS_SCHEMA, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ShareModule } from '../app/share/share.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      animated: false
    }),
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('src/combined-sw.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    ShareModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line
})
export class AppModule { }
