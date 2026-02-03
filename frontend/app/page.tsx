"use client";
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-cyan-500/30 text-cyan-300 text-xs font-medium uppercase tracking-wider mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Issue Tracking System
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight text-slate-900"
            >
              Transform Your City, <br />
              <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">One Report at a Time.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              CivicConnect empowers citizens to report infrastructure issues instantly.
              We use location intelligence and community voting to prioritize what matters most.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/report" className="btn-primary w-full sm:w-auto text-lg py-4 px-8 shadow-cyan-500/25">
                Report an Issue
              </Link>
              <Link href="/map" className="px-8 py-4 rounded-xl glass border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-all w-full sm:w-auto shadow-sm">
                Explore Issue Map
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Abstract Background Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
        />
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Issues Reported", value: "1,240+", color: "text-white" },
              { label: "Resolved", value: "850+", color: "text-cyan-400" },
              { label: "Avg. Response Time", value: "12hrs", color: "text-violet-400" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card text-center py-10"
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-sm text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Priority Alerts Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Urgent Community Alerts</h2>
              <p className="text-slate-400">Issues that have received significant community verification and require immediate attention.</p>
            </div>
            <Link href="/feed" className="text-cyan-400 font-medium hover:underline flex items-center gap-2">
              View All Reports <span className="text-xl">↗</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: "Major Water Main Burst",
                location: "Westside Industrial Park",
                votes: 128,
                category: "Water Supply",
                status: "Reported",
                time: "2 hours ago"
              },
              {
                title: "Dangerous Pothole on High St",
                location: "Downtown Crossroad",
                votes: 94,
                category: "Roads",
                status: "In Progress",
                time: "5 hours ago"
              }
            ].map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card group flex flex-col sm:flex-row gap-6 items-start"
              >
                <div className="w-full sm:w-48 h-32 rounded-xl bg-slate-800 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs text-center p-4">
                    Image Evidence Placeholder
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider">High Priority</span>
                    <span className="text-xs text-slate-500">{alert.time}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{alert.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1">📍 {alert.location}</span>
                    <span className="flex items-center gap-1">📁 {alert.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(j => (
                          <div key={j} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">+{alert.votes} Verification Votes</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${alert.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400">Simple steps to make a big difference.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Snap & Report", desc: "Take a photo, map the location, and submit details in seconds." },
              { title: "Community Verify", desc: "Neighbors vote to validate issues, ensuring priority for real problems." },
              { title: "Government Action", desc: "Authorities receive verified alerts and track resolution progress." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 hover:-translate-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center mb-6 text-xl font-bold text-cyan-400 group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
