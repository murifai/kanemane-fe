'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, CreditCard, LogOut, Camera } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [subscription, setSubscription] = useState({
        plan: 'Free',
        status: 'Active',
        nextBilling: '-',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authAPI.getUser();
                setProfile({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    avatar: userData.avatar || '',
                });
            } catch (error) {
                console.error('Failed to fetch user:', error);
                // Optionally redirect to login if auth fails? 
                // For now, we'll let them see the page but empty/loading might persist or fail gracefully.
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const response = await authAPI.updateProfile({
                name: profile.name,
                phone: profile.phone,
            });

            setSuccess('Profil berhasil diperbarui!');

            // Update profile with response data
            setProfile({
                ...profile,
                name: response.user.name,
                phone: response.user.phone || '',
            });

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Gagal menyimpan profil';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('auth_token');
            router.push('/');
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error('Logout failed:', error);
            }
            localStorage.removeItem('auth_token');
            router.push('/');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Memuat profil...</div>;
    }

    return (
        <div className="max-w-xl mx-auto space-y-4 pb-10">
            {/* Header */}
            <div className="text-center">
                {/* Clickable Large Avatar */}
                <button
                    className="relative inline-block mb-4 group"
                    onClick={() => alert('Fitur ganti foto profil belum tersedia')}
                >
                    <div className="w-24 h-24 bg-[#ff5e75] rounded-full flex items-center justify-center border-4 border-black overflow-hidden mx-auto transition-transform group-hover:scale-105">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-white uppercase">{profile.name.charAt(0)}</span>
                        )}
                    </div>
                    {/* Optional hover overlay or hint, but user said "if clicked it is the change photo button" */}
                </button>
                <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                <p className="text-sm text-gray-500">{profile.email}</p>
            </div>

            {/* Edit Profile Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" /> Edit Profil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border-2 border-green-500 text-green-700 p-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}
                    <Input
                        label="Nama Lengkap"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Nomor Telepon"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+62812345678"
                    />
                    {/* User requested email not editable - removing input entirely as it's already shown in header, or keep as text */}
                    <div className="text-sm text-gray-500">
                        <span className="font-bold block text-black mb-1">Email</span>
                        {profile.email}
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        className="w-full"
                        disabled={saving}
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </CardContent>
            </Card>

            {/* Subscription Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="w-5 h-5" /> Langganan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-[#eafae3] border-2 border-[#7fbf50] p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold text-[#7fbf50] text-lg">{subscription.plan}</p>
                            <p className="text-xs text-gray-600">Status: {subscription.status}</p>
                        </div>
                        <Button variant="secondary" size="sm" className="text-xs h-8">
                            Upgrade
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Logout Button */}
            <div className="pt-2">
                <Button
                    variant="destructive"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" /> Keluar
                </Button>
            </div>
        </div>
    );
}
