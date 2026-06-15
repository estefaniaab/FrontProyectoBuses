importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBmMReOIoOQA7MZKuPWy8v_nRyHMwiY1i8',
  authDomain: 'buses-inteligentes-29678.firebaseapp.com',
  projectId: 'buses-inteligentes-29678',
  storageBucket: 'buses-inteligentes-29678.firebasestorage.app',
  messagingSenderId: '140894319419',
  appId: '1:140894319419:web:0ddab9f7c611352011bd1e',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Notificación en segundo plano:', payload);

  const { title, body } = payload.notification;
  const data = payload.data || {};

  const alertaUrl = `http://localhost:4200/#/alerta-bus?busId=${data.busId}&rutaId=${data.rutaId}&paraderoId=${data.paraderoId}&etaMinutos=${data.etaMinutos}&placa=${data.placa}&nombreRuta=${encodeURIComponent(data.nombreRuta || '')}`;
  const mapaUrl = `http://localhost:4200/#/monitoreo/seguimiento?rutaId=${data.rutaId}`;

  const notificationOptions = {
    body: body,
    icon: '/assets/img/bus-icon.png',
    badge: '/assets/img/badge.png',
    data: {
      alertaUrl: alertaUrl,
      mapaUrl: mapaUrl,
      busId: data.busId,
      rutaId: data.rutaId,
      paraderoId: data.paraderoId,
      etaMinutos: data.etaMinutos,
      placa: data.placa,
      nombreRuta: data.nombreRuta
    },
    actions: [
      { action: 'ver_mapa', title: '🗺️ Ver en mapa' },
      { action: 'preparar_pago', title: '💳 Preparar pago' },
    ],
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  let urlToOpen = data.alertaUrl || 'http://localhost:4200/#/monitoreo/seguimiento';

  if (action === 'ver_mapa') {
    urlToOpen = data.mapaUrl || urlToOpen;
  } else if (action === 'preparar_pago') {
    urlToOpen = `http://localhost:4200/#/boletos/abordar?rutaId=${data.rutaId}&paraderoId=${data.paraderoId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen.split('#')[1]) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
