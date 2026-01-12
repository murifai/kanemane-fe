'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    // If user is already logged in, go to dashboard
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
      return;
    }

    try {
      setLoading(true);
      const data = await authAPI.getGoogleAuthUrl();
      window.location.href = data.url;
    } catch (error) {
      console.error('Gagal mendapatkan URL Google auth:', error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F8F8] font-sans text-[#171717]">
      <Hero onLogin={handleGoogleLogin} loading={loading} />
      <Features />
      <Pricing onLogin={handleGoogleLogin} loading={loading} />
      <CTA onLogin={handleGoogleLogin} loading={loading} />
      <Footer />
    </main>
  );
}
