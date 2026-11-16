'use client';

import { useState } from 'react';

type Issue = { id: string; status: { statusName: string }; staffId: string | null; feedback: { rating: number } | null };
type Staff = { id: string; name: string; staffRole: string | null };

export function IssueActions({ issue, role }: { issue: Issue; role: string }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rating, setRating] = useState('5');
  async function call(url: string, method: string, body?: unknown) {
    setBusy(true); setMessage('');
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Action failed');
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Action failed'); }
    finally { setBusy(false); }
  }
  async function loadStaff() {
    if (staff.length) return;
    const response = await fetch('/api/staff');
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || 'Could not load staff'); return; }
    setStaff(data);
  }
  return <div className="mt-3 flex flex-wrap items-center gap-2">
    {['WARDEN', 'ADMIN'].includes(role) && <>
      <select aria-label="Assign staff" defaultValue={issue.staffId || ''} onFocus={loadStaff} onChange={e => e.target.value && call(`/api/issues/${issue.id}/assign`, 'PATCH', { staffId: e.target.value })} className="max-w-52 py-2 text-xs">
        <option value="">{issue.staffId ? 'Change assignee' : 'Assign staff'}</option>{staff.map(person => <option key={person.id} value={person.id}>{person.name}{person.staffRole ? ` · ${person.staffRole}` : ''}</option>)}
      </select>
      {issue.status.statusName !== 'CLOSED' && <select aria-label="Update issue status" defaultValue="" onChange={e => e.target.value && call(`/api/issues/${issue.id}/status`, 'PATCH', { statusName: e.target.value })} className="max-w-44 py-2 text-xs"><option value="">Change status</option>{['OPEN','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'].map(s => <option key={s}>{s}</option>)}</select>}
    </>}
    {role === 'STAFF' && ['ASSIGNED','IN_PROGRESS'].includes(issue.status.statusName) && <button disabled={busy} onClick={() => call(`/api/issues/${issue.id}/status`, 'PATCH', { statusName: issue.status.statusName === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED' })} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">{issue.status.statusName === 'ASSIGNED' ? 'Start work' : 'Mark resolved'}</button>}
    {role === 'STUDENT' && issue.status.statusName === 'RESOLVED' && !issue.feedback && <><select aria-label="Feedback rating" value={rating} onChange={e => setRating(e.target.value)} className="max-w-32 py-2 text-xs">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} star{n>1?'s':''}</option>)}</select><button disabled={busy} onClick={() => call(`/api/issues/${issue.id}/feedback`, 'POST', { rating: Number(rating) })} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Send feedback</button></>}
    {busy && <span className="text-xs text-slate-500">Saving…</span>}{message && <span role="alert" className="text-xs text-red-600">{message}</span>}
  </div>;
}
