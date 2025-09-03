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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
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

  // Define the notification title and body
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;

  // Define the notification options
  const notificationOptions = {
    body: notificationBody,
    icon: '/assets/icons/icon-192x192.png',  // Ensure the correct path to the icon
    badge: '/assets/icons/icon-72x72.png',  // Optional: Badge icon
    data: payload.data,  // Optional: You can add any extra data here
  };

  // Optionally modify the icon dynamically based on content
  if (notificationTitle.includes('Special')) {
    notificationOptions.icon = '/assets/icons/icon-192x192.png';
  }

  // Show the notification
  new Notification(notificationTitle, notificationOptions);
});