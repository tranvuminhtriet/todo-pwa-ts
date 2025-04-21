const PUBLIC_VAPID_KEY =
  "BNMtmT5_1Z-nM5n2KOOcFa3-QxC6-Rm0tdniSq0K-f9IBrVwx5-aWnRek5HEDTbMPd-0KL_t-c3Uga-fxqe-gsA";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    console.log("✅ Push Subscription:", JSON.stringify(subscription, null, 2));
    try {
      const res = await fetch(
        "https://web-push-express-production.up.railway.app/api/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        }
      );

      if (res.ok) {
        console.log("✅ Subscription sent to server");
      } else {
        console.error("❌ Failed to send subscription to server");
      }
    } catch (err) {
      console.error("❌ Error sending subscription to server", err);
    }
  } else {
    console.warn("Push messaging is not supported");
  }
}
