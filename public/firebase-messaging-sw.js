/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js"
);
importScripts("swEnv.js");

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp(swEnv.NEXT_PUBLIC_FIREBASE_APP_CONFIG);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically
// and you should use data messages for custom notifications.
// For more info see:
// https://firebase.google.com/docs/cloud-messaging/concept-options
messaging.onBackgroundMessage(function (payload) {
  const { title, body, ...data } = payload?.data ?? {};
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const currentNotification = getCurrentNotification(data.transactionId);

  if (currentNotification) {
    currentNotification.close();
  }

  const options = {
    body,
    data,
    icon: "/favicon/favicon-48x48.png",
    vibrate: [100, 50, 100],
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");

  const urlToOpen = new URL(
    "https://zolvent.calabs.dev/private/recurring-expenses/management",
    self.location.origin
  ).href;

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      }

      return clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
  event.notification.close();
});

function getCurrentNotification(transactionId) {
  const notifications = self.registration.getNotifications();
  for (let i = 0; i < notifications.length; i++) {
    console.log("notifications " + i, notifications[i]);
    if (
      notifications[i].data &&
      notifications[i].data.transactionId === transactionId
    ) {
      return notifications[i];
    }
  }
}
