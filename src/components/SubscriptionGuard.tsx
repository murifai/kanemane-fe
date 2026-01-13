import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
    const { subscriptionStatus, isLoading } = useSubscription();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && subscriptionStatus) {
            // Allow access to subscription page itself to prevent loop
            if (pathname === '/dashboard/subscription' || pathname === '/dashboard/profile') {
                return;
            }

            // If not subscribed, redirect to subscription page
            if (!subscriptionStatus.has_subscription || !subscriptionStatus.current_plan) {
                console.log('SubscriptionGuard: Redirecting to subscription. Status:', subscriptionStatus);
                router.push('/dashboard/subscription'); // Assuming the subscription page is inside dashboard layout
            } else {
                console.log('SubscriptionGuard: Access granted. Plan:', subscriptionStatus.current_plan);
            }
        }
    }, [isLoading, subscriptionStatus, router, pathname]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
        );
    }

    // If unsubscribed but attempting to view subscription page, allow it
    if ((!subscriptionStatus?.has_subscription || !subscriptionStatus?.current_plan) && pathname !== '/dashboard/subscription' && pathname !== '/dashboard/profile') {
        return null; // Don't render children while redirecting
    }

    return <>{children}</>;
};
