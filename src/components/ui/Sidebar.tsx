'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowDownUp, User, LogOut } from 'lucide-react';
import MobileNav from './MobileNav';
import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/transactions', label: 'Transaksi', icon: ArrowDownUp },
    { href: '/dashboard/assets', label: 'Aset', icon: Wallet },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authAPI.getUser();
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('auth_token');
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout anyway
            localStorage.removeItem('auth_token');
            router.push('/');
        }
    };

    return (
        <>
            <aside className="hidden md:flex w-64 bg-[#fafafa] border-r-[3px] border-black min-h-screen p-6 flex-col">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-3">
                    <img src="/assets/logo-transparent.svg" alt="Kanemane Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-2xl font-bold text-[#ff5e75]">Kanemane</h1>
                        <p className="text-sm text-[#737373]">Manajemen Keuangan</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-3">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                    flex items-center gap-3 px-4 py-3 font-bold border-[3px] border-black transition-all whitespace-nowrap
                    ${isActive
                                        ? 'bg-[#ff5e75] text-white shadow-[4px_4px_0px_0px_#000000]'
                                        : 'bg-[#f4f4f5] text-[#18181b] hover:bg-[#eeeeee] hover:shadow-[3px_3px_0px_0px_#000000]'
                                    }
                  `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-base">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="mt-auto pt-6 border-t-[3px] border-black">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-400 rounded-none border-[3px] border-black flex items-center justify-center font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || 'Loading...'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 border-[3px] border-black font-bold text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                    </button>
                </div>

            </aside>
            <MobileNav />
        </>
    );
}
