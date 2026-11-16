import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development-only-secret-change-this-now');
export async function createSession(user: { id: string; role: string; name: string }) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret);
  (await cookies()).set('session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret); return payload as { id: string; role: string; name: string }; }
  catch { return null; }
}
export async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, role: true, roomNo: true } });
}
