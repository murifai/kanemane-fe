'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowDownUp, User, Plus } from 'lucide-react';
import { useTransactionModal } from '@/context/TransactionModalContext';

const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/assets', label: 'Aset', icon: Wallet },
    { href: '#', label: 'Tambah', icon: Plus, isAction: true }, // Changed href to '#'
    { href: '/dashboard/transactions', label: 'Transaksi', icon: ArrowDownUp },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
];

export default function MobileNav() {
    const pathname = usePathname();
    const { openModal } = useTransactionModal();

    return (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
            <nav className="bg-white text-black p-2 rounded-2xl shadow-[4px_4px_0px_0px_#000000] border-[3px] border-black flex justify-between items-center px-4">
                {mobileNavItems.map((item, index) => {
                    const isActive = !item.isAction && pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            onClick={(e) => {
                                if (item.isAction) {
                                    e.preventDefault();
                                    openModal();
                                }
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'bg-[#ff5e75] text-white' : 'text-[#737373] hover:text-black hover:bg-gray-100'
                                } ${item.isAction ? 'bg-[#73cfd9] text-black -mt-8 border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] w-12 h-12 rounded-full hover:bg-[#5bc0ca]' : ''}`}
                        >
                            <Icon className={`${item.isAction ? 'w-6 h-6' : 'w-5 h-5'}`} />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
