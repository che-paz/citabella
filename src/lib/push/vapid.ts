export function getVapidPublicKey(): string | null {
  return (
    process.env.VAPID_PUBLIC_KEY ??
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
    null
  );
}

export function isPushConfigured(): boolean {
  const publicKey = getVapidPublicKey();
  return Boolean(
    publicKey && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT
  );
}

export function getVapidConfig():
  | { publicKey: string; privateKey: string; subject: string }
  | null {
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return null;
  }

  return { publicKey, privateKey, subject };
}
