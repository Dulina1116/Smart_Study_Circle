import { useState, useEffect } from "react";
import { Menu, X, GraduationCap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  "Dashboard",
  "Study Circles",
  "Resources",
  "Calendar",
  "Analytics",
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 gradient-teal rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight truncate">
              <span className="sm:hidden">SmartStudy</span>
              <span className="hidden sm:inline">Smart Study Circle</span>
            </span>
          </Link>

          {/* Center nav links – desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-all duration-200"
              >
                {link}
              </a>
            ))}
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 ml-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          </div>

          {/* Right buttons – desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-teal-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Log In
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl gradient-teal hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger – mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } bg-white border-t border-gray-100`}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              {link}
            </a>
          ))}
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 hover:border-teal-400 transition-all duration-200"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </Link>
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-center w-full text-sm font-medium text-gray-700 py-2.5 rounded-lg border border-gray-200 hover:border-teal-300 hover:text-teal-600 transition-all duration-200 bg-transparent"
            >
              Log In
            </Link>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-center w-full text-sm font-semibold text-white py-2.5 rounded-xl gradient-teal hover:opacity-90 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
