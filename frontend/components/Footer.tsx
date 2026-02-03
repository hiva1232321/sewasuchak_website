export default function Footer() {
    return (
        <footer className="py-20 border-t border-white/5 bg-slate-900/50 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                    <div className="col-span-1 md:col-span-2">
                        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-lg">C</span>
                            </div>
                            <span className="text-white">Civic<span className="text-cyan-400">Connect</span></span>
                        </div>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            Bridging the gap between citizens and government through
                            technology, transparency, and community action.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="/report" className="hover:text-cyan-400 transition-colors">Report Issue</a></li>
                            <li><a href="/feed" className="hover:text-cyan-400 transition-colors">Live Dashboard</a></li>
                            <li><a href="/map" className="hover:text-cyan-400 transition-colors">City Map</a></li>
                            <li><a href="/portal" className="hover:text-cyan-400 transition-colors">Official Portal</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Connect</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Twitter / X</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Support</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">
                        © 2026 CivicConnect. All rights reserved. Built for the community.
                    </p>
                    <div className="flex gap-6">
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer">
                            X
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer">
                            L
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
