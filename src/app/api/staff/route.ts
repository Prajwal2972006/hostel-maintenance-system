import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['WARDEN', 'ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const staff = await prisma.user.findMany({ where: { role: 'STAFF' }, select: { id: true, name: true, staffRole: true }, orderBy: { name: 'asc' } });
  return NextResponse.json(staff);
}
