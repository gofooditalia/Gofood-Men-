import { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata: Metadata = {
    title: 'Dashboard - Go!Food Menù',
    description: 'Gestisci il tuo menu digitale',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
