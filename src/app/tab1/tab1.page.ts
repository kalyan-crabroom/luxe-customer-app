import { ChangeDetectorRef, Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';
import { FilterPage } from '../modal/filter/filter.page';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { StatusBar } from '@capacitor/status-bar';

declare var google: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  markers: any = [];
  selectedSegment: string = 'map';
  directionsDisplay = new google.maps.DirectionsRenderer();
  latitude: any;
  longitude: any;
  map: any;
  requests: any = [];
  is_map: boolean = false;
  loginUser: any = [];
  requestData: any = []
  ready: boolean = false;
  gender: any;
  radius: any = '50';
  selectedCheckbox: any = [];
  fetching: any;
  online: boolean = false;
  searchQuery: any;
  totalNotification_count: any = 0;
  data: any = []
  private currentInfoWindow: any = null;
  backgroundCheckData: any;
  isModalOpen: boolean = false;
  upcomingBookings: any;
  private mapIdleTimeout: any = null;

  mapBounds: any = new google.maps.LatLngBounds();


  constructor(
    private navCtrl: NavController,
    private storageService: StorageService,
    private apiService: ApiService,
    private modalCtrl: ModalController,
    private router: Router,
    private common: CommonService,
    public cdref: ChangeDetectorRef,
    private platform: Platform,
  ) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url == "/tabs/home") {
          this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
            if (user != null) {
              this.loginUser = user;
              this.online = this.loginUser.user_meta.user_online;
              this.getRequests();
              this.getNotificationCount();
              this.apiService.getAppSettings(this.loginUser.token);
            }
          });

        }
      }
    });

    this.common.refresh_home.subscribe((res: any) => {
      if (res) {
        this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
          if (user != null) {
            this.loginUser = user;
            this.online = this.loginUser.user_meta.user_online;
            this.getRequests();
          }
        });
      }
    });
  }


  async ionViewWillEnter() {
    this.common.notification_count.subscribe((data: any) => {
      this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
        if (user != null) {
          this.loginUser = user;
          this.online = this.loginUser.user_meta.user_online;
          this.getNotificationCount();
          this.getBackgroundCheckStatus();
        }
      });
    });

    // this.is_map = true;
    this.getCurrentLocationLatLang();
    // this.getCurrentLocationLatLang1();
    if (this.platform.is('android')) {
      await StatusBar.setBackgroundColor({ color: '#000026' });
    }
  }

  getNotificationCount() {
    this.apiService.fetchData(`count_unread_notification`, this.loginUser.token).subscribe((res: any) => {
      this.totalNotification_count = res.un_read;
      console.log('totalNotification', this.totalNotification_count);
    }, (err) => {
      console.log('err', err);
    });
  }

  ngOnInit() {

  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    if (this.selectedSegment == 'map') {
      // this.is_map = true;
      this.getCurrentLocationLatLang();
      // this.getCurrentLocationLatLang1();
    } else if (this.selectedSegment == 'list') {
      this.is_map = false;
      this.getRequests();
    }
  }

  async getCurrentLocationLatLang1() {
    console.log("getCurrentLocationLatLang1");

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };
    try {
      const coordinates = await Geolocation.getCurrentPosition(options);
      console.log("coordinates :", coordinates);
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      this.initMap();
      this.is_map = false;
      this.getRequests();
    } catch (err: any) {
      console.error("Error getting location:", err);
      // this.getCurrentLocationLatLang()
      // if (err.code == 3) {
      //   const coordinates = await Geolocation.getCurrentPosition(options);
      //   console.log("coordinates :", coordinates);
      //   this.latitude = coordinates.coords.latitude;
      //   this.longitude = coordinates.coords.longitude;
      //   this.initMap();
      //   this.is_map = false;
      //   this.getRequests();
      // }
    }
  }

  async getCurrentLocationLatLang() {
    console.log("getCurrentLocationLatLang :", this.loginUser.zip_code);
    this.storageService.getFromStorage('deeplyCalm:therapist').then((user: any) => {
      if (user != null) {
        this.loginUser = user;
        this.apiService.getLatLngFromZip(this.loginUser.zip_code).subscribe((response: any) => {
          console.log("response :", response);
          if (response.status === 'OK') {
            const location = response.results[0].geometry.location;
            this.latitude = location.lat;
            this.longitude = location.lng;
            this.initMap();
            this.is_map = false;
            this.getRequests();
          }
          else {
            this.getCurrentLocationLatLang1();
          }
        }, (err) => {
          console.log("err :", err);
          // this.getCurrentLocationLatLang1();
        });
      }
    });

  }


  getRequests(event: any = '') {
    if (this.fetching) {
      this.fetching.unsubscribe();
    }
    const payLoad = {
      token: this.loginUser.token,
      latitude: this.latitude,
      longitude: this.longitude,
      distance: this.radius,
      therapist_gender: this.gender,
      selectedTreatmentIds: this.selectedCheckbox,
      searchQuery: this.searchQuery,
      online: this.online
    }
    if (!event) {
      this.ready = true;
    }
    console.log("this.online :", this.online);
    this.fetching = this.apiService.send('getNearbyRequests', payLoad).subscribe((res: any) => {
      this.requestData = res.data || [];
      if (!event) {
        this.ready = false;
      }
      console.log("requestData :", this.requestData);
      this.initializeMarkers();
      if (event) {
        event.target.complete();
      }
    }, (err: any) => {
      console.log("err :", err);
      if (!event) {
        this.ready = false;
      }

      if (err.error.error_code == 'token_expired') {
        this.storageService.removeFromStorage('deeplyCalm:therapist');
        this.navCtrl.navigateRoot(['/login']);
      }
      // this.common.presentToast(err.error.message, 'danger');

    });
  }

  handleInput(event: any) {
    this.searchQuery = event.target.value;
    this.getRequests();
  }

  async initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: this.latitude, lng: this.longitude },
      zoom: 10
    });
    const markers = [];
    //for user current location marker
    //   const centerMarkerIcon = {
    //     url: '/assets/icons/map-current.png',
    //     scaledSize: new google.maps.Size(32, 42)
    //   };
    //   const centerMarker = new google.maps.Marker({
    //     position: { lat: this.latitude, lng: this.longitude },
    //     map: this.map,
    //     icon: centerMarkerIcon,
    //     title: 'Your Location'
    //   });
    //   console.log('centerMarker', centerMarker);

    //   const infoWindowContentForLoginUser = `
    //     <div id="infoWindow">
    //         <h5></strong>${this.loginUser.first_name}  ${this.loginUser.last_name}</h5>
    //         <p id="view_details">View Details</p>
    //       </div>
    // `;
    //   const infoWindow = new google.maps.InfoWindow({
    //     content: infoWindowContentForLoginUser
    //   });
    //   centerMarker.addListener('click', () => {
    //     infoWindow.open(this.map, centerMarker);
    //   });

    //   google.maps.event.addListener(infoWindow, 'domready', () => {

    //     let div: any = document.getElementById('view_details') as HTMLElement;

    //     if (div) {
    //       div.addEventListener('click', () => {
    //         this.viewProfile(infoWindow);
    //       });
    //     }
    //   });

    //   markers.push(centerMarker);
    //end our marker code
    this.initializeMarkers();

    // google.maps.event.addListener(this.map, 'idle', () => {
    //   if (this.mapIdleTimeout) {
    //     clearTimeout(this.mapIdleTimeout);
    //   }

    //   // Wait 500ms after last movement
    //   this.mapIdleTimeout = setTimeout(() => {
    //     const center = this.map.getCenter();
    //     if (center) {
    //       this.latitude = center.lat();
    //       this.longitude = center.lng();
    //       console.log('Debounced center:', this.latitude, this.longitude);
    //       this.getRequests();
    //     }
    //   }, 700); // debounce delay in ms
    // });
  }

  // initilizedRequestMarker() {
  //   this.clearMarkers();
  //   const customMarker = {
  //     url: '/assets/icons/map-therapist.png',
  //     scaledSize: new google.maps.Size(32, 42)
  //   };
  //   // this.markers = [];
  //   this.requestData.forEach((item: any) => {
  //     let marker_tmp: any;
  //     const markerPosition = { lat: parseFloat(item.location_lat), lng: parseFloat(item.location_long) };
  //     marker_tmp = new google.maps.Marker({
  //       position: markerPosition,
  //       map: this.map,
  //       icon: customMarker,
  //       title: item.address
  //     });

  //     const infoWindowContent = `
  //       <div id="infoWindow">
  //         <h5></strong>${ item?.user_details?.first_name } ${item?.user_details?.last_name.charAt(0).toUpperCase() }</h5> 
  //         <small></strong>${item.display_date }</small>
  //         <p>${item?.location_details?.location_address}</p>
  //         <p id="view_details">View Details</p>
  //       </div>
  //     `;

  //     const infoWindow = new google.maps.InfoWindow({
  //       content: infoWindowContent
  //     });

  //     marker_tmp.addListener('click', () => {
  //       this.closeCurrentInfoWindow();
  //       infoWindow.open(this.map, marker_tmp);
  //       this.currentInfoWindow = infoWindow;
  //     });

  //     google.maps.event.addListener(infoWindow, 'domready', () => {
  //       let div: any = document.getElementById('view_details') as HTMLElement;
  //       if (div) {
  //         div.addEventListener('click', () => {
  //           this.viewRequestDetails(item, infoWindow);
  //         });
  //       }
  //     });
  //     this.markers.push(marker_tmp);
  //   });

  //   this.upcomingBooking();
  // }

  // initilizedRequestMarker() {
  //   this.clearMarkers();

  //   // Reset bounds before adding new markers
  //   this.mapBounds = new google.maps.LatLngBounds();

  //   const customMarker = {
  //     url: '/assets/icons/map-therapist.png',
  //     scaledSize: new google.maps.Size(32, 42)
  //   };

  //   this.requestData.forEach((item: any) => {
  //     const markerPosition = {
  //       lat: parseFloat(item.location_lat),
  //       lng: parseFloat(item.location_long)
  //     };

  //     const marker_tmp = new google.maps.Marker({
  //       position: markerPosition,
  //       map: this.map,
  //       icon: customMarker,
  //       title: item.address
  //     });

  //     const infoWindowContent = `
  //     <div id="infoWindow">
  //       <h5>${item?.user_details?.first_name} ${item?.user_details?.last_name?.charAt(0).toUpperCase()}</h5>
  //       <small>${item.display_date}</small>
  //       <p>${item?.location_details?.location_address}</p>
  //       <p id="view_details">View Details</p>
  //     </div>
  //   `;

  //     const infoWindow = new google.maps.InfoWindow({
  //       content: infoWindowContent
  //     });

  //     marker_tmp.addListener('click', () => {
  //       this.closeCurrentInfoWindow();
  //       infoWindow.open(this.map, marker_tmp);
  //       this.currentInfoWindow = infoWindow;
  //     });

  //     google.maps.event.addListener(infoWindow, 'domready', () => {
  //       const div: any = document.getElementById('view_details') as HTMLElement;
  //       if (div) {
  //         div.addEventListener('click', () => {
  //           this.viewRequestDetails(item, infoWindow);
  //         });
  //       }
  //     });

  //     this.markers.push(marker_tmp);
  //     this.mapBounds.extend(markerPosition); // ✅ Extend bounds with each marker
  //   });

  //   this.upcomingBooking(); // Fetch next group of markers
  // }



  closeCurrentInfoWindow() {
    if (this.currentInfoWindow) {
      this.currentInfoWindow.close();
      this.currentInfoWindow = null;
    }
  }

  clearMarkers() {
    this.markers.forEach((marker: any) => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  viewRequestDetails(data: any, infoWindow: any) {
    this.goToBooking(data);
    infoWindow.close();
  }

  viewProfile(infoWindow: any) {
    this.navCtrl.navigateForward("/tabs/profile");
    infoWindow.close();
  }

  async filterModal() {
    const modalPage = await this.modalCtrl.create({
      component: FilterPage,
      componentProps: {
        gender: this.gender,
        radius: this.radius,
        selectedCheckbox: this.selectedCheckbox
      },
    });
    modalPage.onDidDismiss().then((modalResponse: any) => {
      if (modalResponse.data.status == 'ok') {
        this.gender = modalResponse.data.gender;
        this.radius = modalResponse.data.radius;
        this.selectedCheckbox = modalResponse.data.selectedCheckbox;
        this.getRequests();
      }
    });
    return await modalPage.present();
  }

  handleRefresh(event: any) {
    this.getRequests(event);
  }

  goToBooking(item: any) {
    let parameter: NavigationExtras = {
      queryParams: {
        booking_id: item.id
      }
    };
    this.router.navigate(['/selected-session'], parameter);
  }

  async updateLocation(event: any) {
    await this.common.showLoader();
    this.online = event.target.checked;
    // const coordinates = await Geolocation.getCurrentPosition();
    // this.latitude = coordinates.coords.latitude;
    // this.longitude = coordinates.coords.longitude;
    this.apiService.send('update-current-location', { token: this.loginUser.token, user_online: this.online, user_lat: this.latitude, user_long: this.longitude }).subscribe(async (res: any) => {
      await this.common.dismissLoading();
      this.loginUser.user_meta.user_online = this.online;
      this.storageService.saveToStorage('deeplyCalm:therapist', this.loginUser);
      this.getRequests();
    }, async (err: any) => {
      await this.common.dismissLoading();
    });
  }

  getBackgroundCheckStatus() {
    this.apiService.fetchData(`getBackgroundCheckStatus`, this.loginUser.token).subscribe((res: any) => {
      if (res.success) {
        this.isModalOpen = true;
      }
      this.backgroundCheckData = res;
      console.log("backgroundCheckData :", this.backgroundCheckData);
    }, (err) => {
      console.log("err :", err);
    });
  }

  goToBackGroundCheck() {
    this.isModalOpen = false;
    this.cdref.detectChanges();
    this.navCtrl.navigateRoot(['/edit-background-check']);
  }

  // upcomingBooking() {
  //   const payload: any = {
  //     token: this.loginUser.token,
  //     status: 'upcoming'
  //   };
  //   this.apiService.send('getBookingByDate', payload).subscribe((res: any) => {
  //     this.upcomingBookings = res ?? [];
  //     console.log("upcoming :", this.upcomingBookings);

  //     const customMarker = {
  //       url: '/assets/icons/upcoming-session.png',
  //       scaledSize: new google.maps.Size(32, 42)
  //     };
  //     this.upcomingBookings.forEach((item: any) => {
  //       let marker_tmp: any;
  //       const markerPosition = { lat: parseFloat(item.location_lat), lng: parseFloat(item.location_long) };
  //       marker_tmp = new google.maps.Marker({
  //         position: markerPosition,
  //         map: this.map,
  //         icon: customMarker,
  //         title: item.address
  //       });

  //       const infoWindowContent = `
  //       <div id="infoWindow">
  //         <h5></strong>${ item?.user?.first_name} ${item?.user?.last_name.charAt(0).toUpperCase() }</h5>
  //         <small></strong>${ item.display_date }</small>
  //         <p>${item?.location_details?.location_address}</p>
  //         <p id="view_details">View Details</p>
  //       </div>
  //     `;

  //       const infoWindow = new google.maps.InfoWindow({
  //         content: infoWindowContent
  //       });

  //       marker_tmp.addListener('click', () => {
  //         this.closeCurrentInfoWindow();
  //         infoWindow.open(this.map, marker_tmp);
  //         this.currentInfoWindow = infoWindow;
  //       });

  //       google.maps.event.addListener(infoWindow, 'domready', () => {
  //         let div: any = document.getElementById('view_details') as HTMLElement;
  //         if (div) {
  //           div.addEventListener('click', () => {
  //             this.viewRequestDetails(item, infoWindow);
  //           });
  //         }
  //       });
  //       this.markers.push(marker_tmp);
  //     });

  //   }, (err) => {
  //     this.upcomingBookings = [];
  //   });
  // }

  // upcomingBooking() {
  //   const payload: any = {
  //     token: this.loginUser.token,
  //     status: 'upcoming'
  //   };

  //   this.apiService.send('getBookingByDate', payload).subscribe((res: any) => {
  //     this.upcomingBookings = res ?? [];
  //     console.log("upcoming:", this.upcomingBookings);

  //     const customMarker = {
  //       url: '/assets/icons/upcoming-session.png',
  //       scaledSize: new google.maps.Size(32, 42)
  //     };

  //     this.upcomingBookings.forEach((item: any) => {
  //       const markerPosition = {
  //         lat: parseFloat(item.location_lat),
  //         lng: parseFloat(item.location_long)
  //       };

  //       const marker_tmp = new google.maps.Marker({
  //         position: markerPosition,
  //         map: this.map,
  //         icon: customMarker,
  //         title: item.address
  //       });

  //       const infoWindowContent = `
  //       <div id="infoWindow">
  //         <h5>${item?.user?.first_name} ${item?.user?.last_name?.charAt(0).toUpperCase()}</h5>
  //         <small>${item.display_date}</small>
  //         <p>${item?.location_details?.location_address}</p>
  //         <p id="view_details">View Details</p>
  //       </div>
  //     `;

  //       const infoWindow = new google.maps.InfoWindow({
  //         content: infoWindowContent
  //       });

  //       marker_tmp.addListener('click', () => {
  //         this.closeCurrentInfoWindow();
  //         infoWindow.open(this.map, marker_tmp);
  //         this.currentInfoWindow = infoWindow;
  //       });

  //       google.maps.event.addListener(infoWindow, 'domready', () => {
  //         const div: any = document.getElementById('view_details') as HTMLElement;
  //         if (div) {
  //           div.addEventListener('click', () => {
  //             this.viewRequestDetails(item, infoWindow);
  //           });
  //         }
  //       });

  //       this.markers.push(marker_tmp);
  //       this.mapBounds.extend(markerPosition);
  //     });

  //     if (this.markers.length > 1) {
  //       if (!this.mapBounds.isEmpty()) {
  //         this.map.fitBounds(this.mapBounds);
  //       }
  //     } else {
  //       this.map.setCenter(new google.maps.LatLng(this.latitude, this.longitude));
  //       this.map.setZoom(11);
  //     }

  //   }, (err) => {
  //     console.error("Error loading upcoming bookings:", err);
  //     this.upcomingBookings = [];

  //     // If no upcoming bookings, still fit to current bounds (from requestData)
  //     if (!this.mapBounds.isEmpty()) {
  //       this.map.fitBounds(this.mapBounds);
  //     }
  //   });
  // }

  initializeMarkers() {
    this.clearMarkers();

    // Reset bounds before adding new markers
    this.mapBounds = new google.maps.LatLngBounds();

    // Custom marker settings
    const customMarkerRequest = {
      url: '/assets/icons/map-therapist.png',
      scaledSize: new google.maps.Size(32, 42)
    };

    const customMarkerUpcoming = {
      url: '/assets/icons/upcoming-session.png',
      scaledSize: new google.maps.Size(32, 42)
    };

    let locations: any[] = [];

    // API call to fetch upcomingBookings
    const payload: any = {
      token: this.loginUser.token,
      status: 'upcoming'
    };

    this.apiService.send('getBookingByDate', payload).subscribe((res: any) => {
      this.upcomingBookings = res ?? [];
      console.log("upcoming:", this.upcomingBookings);

      // Combine requestData and upcomingBookings
      let markersData = [...this.requestData, ...this.upcomingBookings]; // Merge both data arrays

      markersData.forEach((item: any) => {
        let markerPosition = {
          lat: parseFloat(item.location_lat),
          lng: parseFloat(item.location_long)
        };

        // Check for same location and apply a small offset to avoid overlapping
        const existingLocation = locations.find(loc => loc.lat === markerPosition.lat && loc.lng === markerPosition.lng);
        if (existingLocation) {
          markerPosition.lat += (Math.random() * 0.0001); // Small random offset for latitude
          markerPosition.lng += (Math.random() * 0.0001); // Small random offset for longitude
        } else {
          locations.push(markerPosition); // Add new location to avoid duplicate processing
        }

        // Set the appropriate icon based on whether it's from requestData or upcomingBookings
        const isUpcoming = this.upcomingBookings.includes(item);
        const customMarker = isUpcoming ? customMarkerUpcoming : customMarkerRequest;

        const marker_tmp = new google.maps.Marker({
          position: markerPosition,
          map: this.map,
          icon: customMarker,
          title: item.address
        });

        const infoWindowContent = `
            <div id="infoWindow">
                <h5>${item?.user_details?.first_name} ${item?.user_details?.last_name?.charAt(0).toUpperCase()}</h5>
                <small>${item.display_date}</small>
                <p>${item?.location_details?.location_address}</p>
                <p id="view_details">View Details</p>
            </div>
          `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent
        });

        marker_tmp.addListener('click', () => {
          this.closeCurrentInfoWindow();
          infoWindow.open(this.map, marker_tmp);
          this.currentInfoWindow = infoWindow;
        });

        google.maps.event.addListener(infoWindow, 'domready', () => {
          const div: any = document.getElementById('view_details') as HTMLElement;
          if (div) {
            div.addEventListener('click', () => {
              this.viewRequestDetails(item, infoWindow);
            });
          }
        });

        this.markers.push(marker_tmp);
        this.mapBounds.extend(markerPosition);
      });

      // Zoom 10: Covers a 20-mile radius.

      // Zoom 9: Covers around a 40-mile radius.

      // Zoom 8: Covers a 60-mile radius (approximate).

      if (this.markers.length === 0) {
        const centerLatLng = new google.maps.LatLng(this.latitude, this.longitude);
        this.map.setCenter(centerLatLng);
        this.map.setZoom(8);
      } else if (this.markers.length == 1) {
        const singleBookingPosition = new google.maps.LatLng(
          this.markers[0].getPosition().lat(),
          this.markers[0].getPosition().lng()
        );
        this.map.setCenter(singleBookingPosition);
        this.map.setZoom(10);
      } else {
        if (!this.mapBounds.isEmpty()) {
          this.map.fitBounds(this.mapBounds);
          this.map.setZoom(10);
        }
        // new MarkerClusterer(this.map, this.markers, {
        //   imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'  // Default cluster icon
        // });
      }
    }, (err) => {
      console.error("Error loading upcoming bookings:", err);
      this.upcomingBookings = [];
      if (!this.mapBounds.isEmpty()) {
        this.map.fitBounds(this.mapBounds);
      }
    });
  }

}
