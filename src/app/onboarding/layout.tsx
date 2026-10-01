import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Configurazione - Go!Food Menù',
    description: 'Configura il tuo ristorante in pochi passaggi.',
};

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
