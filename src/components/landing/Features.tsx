import { BarChart3, Calculator, Camera, MessageCircle } from 'lucide-react';
import FeatureCarousel from './FeatureCarousel';

export default function Features() {
    return (
        <section className="py-20 px-4 bg-white border-y-[3px] border-black">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 bg-[#73cfd9] inline-block px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000]">Fitur Keren</h2>
                    <p className="text-xl mt-4 font-bold">Semua yang kamu butuhkan untuk atur duit.</p>
                </div>

                <FeatureCarousel />
            </div>
        </section>
    );
}
