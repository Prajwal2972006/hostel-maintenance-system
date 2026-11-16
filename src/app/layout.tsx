import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'HostelCare | Maintenance Tracker', description: 'Hostel maintenance and issue tracking system' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
