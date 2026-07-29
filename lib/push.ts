import webPush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    'mailto:admin@aford.app',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  title: string,
  body: string
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured, skipping push notification');
    return;
  }

  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title,
        body,
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-192x192.svg',
      })
    );
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

export async function sendBudgetAlert(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  categoryName: string,
  spent: number,
  budget: number
) {
  const title = 'Alerta de presupuesto';
  const body = `Has gastado $${spent.toLocaleString('es-CL')} de $${budget.toLocaleString('es-CL')} en ${categoryName}`;

  await Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, title, body))
  );
}

export async function sendInstallmentReminder(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  categoryName: string,
  amount: number,
  date: string
) {
  const title = 'Cuota próxima a vencer';
  const body = `Tu cuota de ${categoryName} por $${amount.toLocaleString('es-CL')} vence el ${new Date(date).toLocaleDateString('es-CL')}`;

  await Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, title, body))
  );
}

export async function sendGoalReminder(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  goalName: string,
  remaining: number,
  targetDate: string | null
) {
  const title = 'Meta de ahorro próxima a vencer';
  let body = `Te faltan $${remaining.toLocaleString('es-CL')} para tu meta "${goalName}"`;
  if (targetDate) {
    body += `. Fecha objetivo: ${new Date(targetDate).toLocaleDateString('es-CL')}`;
  }

  await Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, title, body))
  );
}
