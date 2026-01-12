'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { TransactionModalProvider } from '@/context/TransactionModalContext';
import TransactionFlowModal from '@/components/dashboard/TransactionFlowModal';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndOnboarding = async () => {
            // Check if user is authenticated
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            // Check onboarding status
            try {
                const { onboardingService } = await import('@/lib/services/onboarding');
                const status = await onboardingService.checkStatus();

                if (!status.completed) {
                    // Redirect to onboarding if not completed
                    router.push('/onboarding');
                }
            } catch (error: any) {
                console.error('Failed to check onboarding status:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    router.push('/');
                }
            }
        };

        checkAuthAndOnboarding();
    }, [router]);

    return (
        <TransactionModalProvider>
            <div className="flex flex-col md:flex-row min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                        {children}
                    </main>
                </div>
                <TransactionFlowModal />
            </div>
        </TransactionModalProvider>
    );
}
