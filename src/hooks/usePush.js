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
    const res = await fetch(`${BASE_URL}/push/public-key`);
    const { publicKey } = await res.json();

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Reusar suscripción existente o crear nueva
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    // Siempre reenviar al backend — cada dispositivo/sesión necesita registrarse
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
