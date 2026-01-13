import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscriptionService } from '../lib/services/subscription';
import type { SubscriptionStatus, FeatureAccess } from '../lib/types';

interface SubscriptionContextType {
    subscriptionStatus: SubscriptionStatus | null;
    featureAccess: FeatureAccess;
    isLoading: boolean;
    error: string | null;
    refreshSubscription: () => Promise<void>;
    canAccessFeature: (feature: 'export' | 'scan' | 'whatsapp') => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
    children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [featureAccess, setFeatureAccess] = useState<FeatureAccess>({
        export: false,
        scan: false,
        whatsapp: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const status = await subscriptionService.getStatus();
            console.log('SubscriptionContext: Fetched status:', status);
            setSubscriptionStatus(status);
            setFeatureAccess(subscriptionService.getFeatureAccess(status));
        } catch (err: any) {
            console.error('Failed to fetch subscription:', err);
            setError(err.message || 'Failed to load subscription');
            // Set default null tier on error (will trigger guard)
            setSubscriptionStatus({
                has_subscription: false,
                current_plan: null,
                subscription: null
            });
            setFeatureAccess({
                export: false,
                scan: false,
                whatsapp: false,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    const canAccessFeature = (feature: 'export' | 'scan' | 'whatsapp'): boolean => {
        if (!subscriptionStatus) return false;
        return subscriptionService.canAccessFeature(subscriptionStatus, feature);
    };

    const value: SubscriptionContextType = {
        subscriptionStatus,
        featureAccess,
        isLoading,
        error,
        refreshSubscription: fetchSubscription,
        canAccessFeature,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = (): SubscriptionContextType => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
