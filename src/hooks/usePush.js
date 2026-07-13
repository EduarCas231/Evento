const BASE_URL = process.env.REACT_APP_API_URL || 'https://comapi.duckdns.org/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export async function suscribirPush(token) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push no soportado en este navegador');
    return;
  }

  try {
    if (Notification.permission === 'default') {
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') {
        console.warn('Permiso de notificaciones denegado o no concedido');
        return;
      }
    } else if (Notification.permission === 'denied') {
      console.warn('Notificaciones bloqueadas en el navegador');
      return;
    }

    const res = await fetch(`${BASE_URL}/push/public-key`);
    if (!res.ok) throw new Error('No fue posible obtener la clave pública VAPID');
    const { publicKey } = await res.json();

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (sub) {
      try {
        await sub.unsubscribe();
      } catch (e) {
        console.warn('No se pudo cancelar la suscripción anterior:', e);
      }
      sub = null;
    }

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await fetch(`${BASE_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sub),
    });

    console.log('Push suscrito OK');
  } catch (e) {
    console.error('Error suscribiendo push:', e);
  }
}
