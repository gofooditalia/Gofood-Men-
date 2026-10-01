import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recupera Password - Go!Food Menù',
    description: 'Hai dimenticato la password? Recuperala qui.',
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
