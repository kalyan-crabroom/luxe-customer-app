importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9FIJEiDGkULI766Ze8RUXcmhefVKMLG4",
  authDomain: "luxe-touch.firebaseapp.com",
  projectId: "luxe-touch",
  storageBucket: "luxe-touch.appspot.com",
  messagingSenderId: "669095162229",
  appId: "1:669095162229:web:7300a15c3dc845020b233c"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background notifications
// messaging.onBackgroundMessage(function(payload) {
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/assets/icons/icon-192x192.png', // Path to your notification icon
//     badge: '/assets/icons/badge-72x72.png'  // Optional: Path to a smaller badge icon
//   };

//   // Show the notification
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });


messaging.onMessage(function (payload) {
  console.log('Notification received in foreground', payload);
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;

  const notificationOptions = {
    body: notificationBody,
    icon: '/assets/icons/icon-192x192.png',  
    badge: '/assets/icons/icon-72x72.png',  
    data: payload.data,  
  };

  if (notificationTitle.includes('Special')) {
    notificationOptions.icon = '/assets/icons/icon-192x192.png';
  }
  new Notification(notificationTitle, notificationOptions);
});