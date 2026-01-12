'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowDownUp, User } from 'lucide-react';
import MobileNav from './MobileNav';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/transactions', label: 'Transaksi', icon: ArrowDownUp },
    { href: '/dashboard/assets', label: 'Aset', icon: Wallet },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();

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

            </aside>
            <MobileNav />
        </>
    );
}
