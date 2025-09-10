// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  SITE_URL: 'https://bhaveshd.sg-host.com/',
  API_URL: 'https://bhaveshd.sg-host.com/api/v1/auth/',
  API_URL2: 'https://bhaveshd.sg-host.com/api/v1/',
  firebaseConfig: {
    apiKey: "AIzaSyD9FIJEiDGkULI766Ze8RUXcmhefVKMLG4",
    authDomain: "luxe-touch.firebaseapp.com",
    projectId: "luxe-touch",
    storageBucket: "luxe-touch.appspot.com",
    messagingSenderId: "669095162229",
    appId: "1:669095162229:web:7300a15c3dc845020b233c"
  },
  // stripe_pk_key: "pk_test_51PR6pRGFCdiFZ5kAf1ryNh0zIikWzjZjXHJLIxfpuafT6WF6ZK7CCvp5rpv6O8qnhZOIx9HSrTXIRq9KpRzUlXE100fidnlxOc",
  stripe_pk_key: "pk_live_51R43xQChcONW5YCQcyOAUxSIIeLNFv4C9RxrxEvVlz9cXIV6fMZCnInQqaVJeEFNyHZRRan4Yx8JyUXA5CYFpblY00hZhWIq1y",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
