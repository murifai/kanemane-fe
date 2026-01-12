export default function Footer() {
    return (
        <footer className="bg-[#171717] text-white border-t-[3px] border-black py-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <img src="/assets/logo-transparent.svg" alt="Kanemane Logo" className="w-8 h-8 object-contain bg-white rounded-full p-1 border-2 border-black" />
                        <h2 className="text-2xl font-bold">Kanemane</h2>
                    </div>
                    <p className="text-gray-400">Atur uangmu, atur hidupmu.</p>
                </div>

                <div className="text-sm text-gray-500 font-mono">
                    &copy; {new Date().getFullYear()} Kanemane. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
