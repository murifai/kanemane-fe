import { api } from '../api';

export interface OnboardingStatus {
    completed: boolean;
    has_assets: boolean;
    has_primary_asset: boolean;
}

export const onboardingService = {
    // Complete onboarding with primary asset (uses auth token)
    complete: async (primary_asset_id: number): Promise<{ message: string; user: any }> => {
        const response = await api.post('/onboarding/complete', { primary_asset_id });
        return response.data;
    },

    // Check onboarding status (requires auth)
    checkStatus: async (): Promise<OnboardingStatus> => {
        const response = await api.get('/onboarding/check');
        return response.data;
    },
};

