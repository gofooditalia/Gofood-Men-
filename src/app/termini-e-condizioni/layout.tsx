import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Termini e Condizioni - Go!Food Menù',
    description: 'Leggi i termini e le condizioni di utilizzo di Go!Food Menù.',
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
