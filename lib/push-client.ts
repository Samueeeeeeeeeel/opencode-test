'use client';

import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const sub = subscription.toJSON();
    if (sub.endpoint && sub.keys) {
      await fetch('/api/user/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        }),
      });
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unregisterPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await fetch(`/api/user/push-subscription?endpoint=${encodeURIComponent(endpoint)}`, {
        method: 'DELETE',
      });
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
  }
}

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const isSupported = typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  useEffect(() => {
    if (isSupported) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, [isSupported]);

  const subscribe = async () => {
    const sub = await registerPushSubscription();
    if (sub) setIsSubscribed(true);
  };

  const unsubscribe = async () => {
    await unregisterPushSubscription();
    setIsSubscribed(false);
  };

  return { isSubscribed, isSupported, subscribe, unsubscribe };
}
