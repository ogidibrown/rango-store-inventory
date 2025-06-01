"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../libs/firebase";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          <span className="text-[#ffd100]">Rango</span> Inventory App
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 relative">
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${
              pathname === "/dashboard" ? "text-[#ffd100]" : "text-gray-700"
            } hover:text-[#ffd100]`}
          >
            Dashboard
          </Link>

          {/* Items Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <span
              className={`cursor-pointer text-sm font-medium ${
                pathname.startsWith("/items") ? "text-[#ffd100]" : "text-gray-700"
              } hover:text-[#ffd100]`}
            >
              Items
            </span>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border shadow-md rounded-md z-50">
                {[
                  { label: "All Items", href: "/items/all-items" },
                  { label: "Filters", href: "/items/filters" },
                  { label: "Volvo", href: "/items/volvo" },
                  { label: "Man Diesel", href: "/items/man-diesel" },
                  { label: "GET", href: "/items/get" },
                  { label: "Lubricants", href: "/items/lubricants" },
                  { label: "Tyres", href: "/items/tyres" },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/add-items"
            className={`text-sm font-medium ${
              pathname === "/add-items" ? "text-[#ffd100]" : "text-gray-700"
            } hover:text-[#ffd100]`}
          >
            Add Item
          </Link>
          <Link
            href="/items/stock-history"
            className={`text-sm font-medium ${
              pathname === "/stock-history" ? "text-[#ffd100]" : "text-gray-700"
            } hover:text-[#ffd100]`}
          >
            Stock History
          </Link>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 text-blue-600 rounded border-2 text-sm hover:bg-[#ffd100] hover:text-white"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-4 px-3 py-1 text-blue-600 rounded border-2 text-sm hover:bg-[#ffd100] hover:text-white"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Dashboard
          </Link>

          <details className="group">
            <summary className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
              Items
            </summary>
            <div className="pl-6 pb-2">
              {[
                { label: "All Items", href: "/items/all-items" },
                { label: "Filters", href: "/items/filters" },
                { label: "Volvo", href: "/items/volvo" },
                { label: "Man Diesel", href: "/items/man-diesel" },
                { label: "GET", href: "/items/get" },
                { label: "Lubricants", href: "/items/lubricants" },
                { label: "Tyres", href: "/items/tyres" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-1 text-sm text-gray-600 hover:bg-gray-100"
                >
                  {label}
                </Link>
              ))}
            </div>
          </details>

          <Link href="/add-items" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Add Item
          </Link>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
