'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { TransactionModalProvider } from '@/context/TransactionModalContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import TransactionFlowModal from '@/components/dashboard/TransactionFlowModal';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuthAndOnboarding = async () => {
            // Check if user is authenticated
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            // Allow access to subscription page even without onboarding
            if (pathname === '/dashboard/subscription') {
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
    }, [router, pathname]);

    return (
        <SubscriptionProvider>
            <TransactionModalProvider>
                <div className="flex flex-col md:flex-row min-h-screen">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                            <SubscriptionGuard>
                                {children}
                            </SubscriptionGuard>
                        </main>
                    </div>
                    <TransactionFlowModal />
                </div>
            </TransactionModalProvider>
        </SubscriptionProvider>
    );
}
