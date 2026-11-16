import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { logActivity } from '@/lib/mongodb';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['WARDEN', 'ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Only wardens/admins can assign staff' }, { status: 403 });
  try {
    const { id } = await params;
    const { staffId } = z.object({ staffId: z.string().min(1) }).parse(await req.json());
    const staff = await prisma.user.findFirst({ where: { id: staffId, role: 'STAFF' } });
    if (!staff) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    const assigned = await prisma.maintenanceIssue.update({ where: { id }, data: { staffId, status: { connect: { statusName: 'ASSIGNED' } } }, include: { status: true, staff: { select: { name: true } } } });
    await logActivity('ISSUE_ASSIGNED', user.id, { issueId: id, staffId });
    return NextResponse.json(assigned);
  } catch { return NextResponse.json({ error: 'Could not assign issue' }, { status: 400 }); }
}
