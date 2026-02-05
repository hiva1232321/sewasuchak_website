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
                            <span className="text-white">सेवा<span className="text-cyan-400">सूचक</span></span>
                        </div>
                        <p className="text-white/50 max-w-sm leading-relaxed">
                            Bridging the gap between citizens and government through
                            technology, transparency, and community action.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li><a href="/report" className="hover:text-cyan-400 transition-colors">Report Issue</a></li>
                            <li><a href="/feed" className="hover:text-cyan-400 transition-colors">Live Dashboard</a></li>
                            <li><a href="/map" className="hover:text-cyan-400 transition-colors">City Map</a></li>
                            <li><a href="/portal" className="hover:text-cyan-400 transition-colors">Official Portal</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Connect</h4>
                        <ul className="space-y-4 text-sm text-white/50"> 
                            <li><a href="https://www.facebook.com/shiva.matangulu" className="hover:text-cyan-400 transition-colors">Facebook</a></li>
                            <li><a href="https://www.linkedin.com/in/shivamatangulu/" className="hover:text-cyan-400 transition-colors">LinkedIn</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Support</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/50">
                        © 2026 Sewasuchak. All rights reserved. Built for the community.
                    </p>
                    <p className="text-xs text-white/50">
                        For more contact with Shiva Matangulu (+977 9741802468)
                    </p>
                    <div className="flex gap-6">
  <a href="https://www.instagram.com/shiva_matangulu/" target="_blank" rel="noopener noreferrer">
    <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-red hover:border-red-400 hover:text-red-500 transition-all cursor-pointer">
      {/* Instagram */}
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zm-5 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm0 2a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM17.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
      </svg>
    </div>
  </a>

  <a href="https://www.facebook.com/shiva.matangulu" target="_blank" rel="noopener noreferrer">
    <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-black hover:border-blue-400 hover:text-blue-400 transition-all cursor-pointer">
      {/* Facebook */}
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-2.9h2.5V9.4c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.3 0-1.7.8-1.7 1.6v1.9H16l-.4 2.9h-2.5v7A10 10 0 0022 12z"/>
      </svg>
    </div>
  </a>

  <a href="https://www.linkedin.com/in/shivamatangulu/" target="_blank" rel="noopener noreferrer">
    <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-black hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer">
      {/* LinkedIn */}
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 23.5h4V7.98h-4V23.5zM8.5 7.98h3.8v2.1h.1c.5-1 1.8-2.1 3.7-2.1 4 0 4.7 2.6 4.7 6v7.5h-4v-6.6c0-1.6 0-3.7-2.3-3.7s-2.6 1.7-2.6 3.6v6.7h-4V7.98z"/>
      </svg>
    </div>
  </a>
</div>

                </div>
            </div>
        </footer>
    );
}
