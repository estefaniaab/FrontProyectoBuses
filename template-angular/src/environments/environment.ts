// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url_ms_security: 'http://localhost:8080/api',
  url_ms_business: 'http://localhost:3000/api',
  url_ms_notifications: 'http://localhost:3001/api',
  recaptcha_site_key_v3: '6LdhnKgsAAAAAHq9EtCkq_0mtlSchufvq8HhF933',
    firebase: {
      apiKey: 'AIzaSyBmMReOIoOQA7MZKuPWy8v_nRyHMwiY1i8',
      authDomain: 'buses-inteligentes-29678.firebaseapp.com',
      projectId: 'buses-inteligentes-29678',
      storageBucket: 'buses-inteligentes-29678.firebasestorage.app',
      messagingSenderId: '140894319419',
      appId: '1:140894319419:web:0ddab9f7c611352011bd1e',
      vapidKey: 'BEXfqKEeOdNWUE85Fxnh8r050knrDmqeTksGgStTF_yn3ewVwE_WH_zvJNLVmYSftTRzBhnkSFtFfBNGjBYnBAw'
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
