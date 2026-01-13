import { api } from '../api';
import type { SubscriptionStatus, SubscriptionPlan } from '../types';

export const subscriptionService = {
    /**
     * Get current subscription status
     */
    async getStatus(): Promise<SubscriptionStatus> {
        const response = await api.get('/subscription');
        const data = response.data.data;

        // Transform response to match SubscriptionStatus interface
        return {
            has_subscription: data.has_subscription,
            current_plan: data.current_plan || null,
            subscription: data.subscription,
        };
    },

    /**
     * Get available subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await api.get('/subscription/plans');
        return response.data.data;
    },

    /**
     * Create checkout session for a plan
     */
    async checkout(plan: 'basic' | 'pro'): Promise<any> {
        const response = await api.post('/subscription/checkout', { plan });
        return response.data.data;
    },

    /**
     * Check payment status
     */
    async checkPaymentStatus(orderId: string): Promise<any> {
        const response = await api.get(`/subscription/status/${orderId}`);
        return response.data.data;
    },

    /**
     * Cancel subscription
     */
    async cancel(): Promise<void> {
        await api.post('/subscription/cancel');
    },

    /**
     * Check if user can access a specific feature
     */
    canAccessFeature(subscriptionStatus: SubscriptionStatus, feature: 'export' | 'scan' | 'whatsapp'): boolean {
        const tier = subscriptionStatus.current_plan;

        // Basic tier doesn't have access to export, scan, or whatsapp
        if (tier === 'basic') {
            return false;
        }

        // Pro tier has access to all features
        return tier === 'pro';
    },

    /**
     * Get feature access object
     */
    getFeatureAccess(subscriptionStatus: SubscriptionStatus) {
        const tier = subscriptionStatus.current_plan;

        return {
            export: tier === 'pro',
            scan: tier === 'pro',
            whatsapp: tier === 'pro',
        };
    },
};
