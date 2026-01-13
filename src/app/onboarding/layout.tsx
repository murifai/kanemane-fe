'use client';

import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SubscriptionProvider>
            <SubscriptionGuard>
                {children}
            </SubscriptionGuard>
        </SubscriptionProvider>
    );
}
