import React, { ReactNode } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Crown } from 'lucide-react';

interface FeatureGuardProps {
    feature: 'export' | 'scan' | 'whatsapp';
    children: ReactNode;
    fallback?: ReactNode;
    showUpgradePrompt?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
    feature,
    children,
    fallback,
    showUpgradePrompt = true,
}) => {
    const { canAccessFeature, subscriptionStatus } = useSubscription();

    const hasAccess = canAccessFeature(feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
        return <UpgradePrompt feature={feature} currentTier={subscriptionStatus?.current_plan || null} />;
    }

    return null;
};

interface UpgradePromptProps {
    feature: 'export' | 'scan' | 'whatsapp';
    currentTier: 'basic' | 'pro' | null;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, currentTier }) => {
    const featureNames = {
        export: 'Laporan Keuangan',
        scan: 'Scan Resi',
        whatsapp: 'Integrasi WhatsApp',
    };

    const featureName = featureNames[feature];

    return (
        <div className="p-6 border-4 border-black bg-yellow-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-400 border-4 border-black flex items-center justify-center">
                        <Crown className="w-7 h-7 text-black" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-black mb-2">Fitur Pro</h3>
                    <p className="text-gray-800 mb-4">
                        <strong>{featureName}</strong> hanya tersedia untuk pengguna Pro.
                        Upgrade ke Pro untuk mengakses fitur ini.
                    </p>
                    <a
                        href="/subscription"
                        className="inline-block px-6 py-3 bg-pink-400 border-4 border-black font-black text-black hover:bg-pink-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        Upgrade ke Pro →
                    </a>
                </div>
            </div>
        </div>
    );
};
