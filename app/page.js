// src/app/landing-page/page.js
import Link from "next/link";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-wide">StockTrack</h1>
        <nav className="space-x-4 hidden md:block">
          <Link href="/login" className="hover:text-indigo-400">Login</Link>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Simplify Your <span className="text-indigo-400">Stock</span> Management
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
          Track your inventory in real-time, stay ahead with low-stock alerts, and manage your parts effortlessly — all in one app.
        </p>
        <Link href="/login">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full text-lg transition">
            Get Started
          </button>
        </Link>
      </main>

      <section className="bg-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">📦 Inventory In/Out</h3>
            <p className="text-gray-400">Track every stock movement with timestamps and categories.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">🚨 Low Stock Alerts</h3>
            <p className="text-gray-400">Get notified before you're out of supplies.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">📊 Reports & History</h3>
            <p className="text-gray-400">Export CSV/PDF reports and audit item histories with ease.</p>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

