import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

interface Props {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
    const router = useRouter();

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');

        if (!isLoggedIn) {
            toast.error('Please login to access dashboard');
            router.push('/login');
        }
    }, [router]);

    return <>{children}</>;
} 