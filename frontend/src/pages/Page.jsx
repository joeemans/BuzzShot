import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import buzzshotLogo from "../assets/BuzzShot_logo.png";

const Page = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logoutHandle = async () => {
    await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f0f] text-white">
      {/* Nav Bar */}
      <nav className="flex items-center justify-between bg-[#1f1f1f] px-4 py-4 shadow-md md:px-8">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link to="/home">
            <img
              src={buzzshotLogo}
              alt="BuzzShot Logo"
              className="h-8 md:h-10"
            />
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden space-x-6 text-lg font-semibold md:flex">
            <Link to="/movies" className="transition hover:text-gray-300">
              Movies
            </Link>
            <Link to="/series" className="transition hover:text-gray-300">
              Series
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="block p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Logout Button */}
        <div className="hidden md:block">
          <button
            onClick={logoutHandle}
            className="rounded-md bg-red-600 px-4 py-2 transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 z-50 w-full bg-[#1f1f1f] p-4 shadow-lg md:hidden">
          <div className="flex flex-col space-y-4">
            <Link
              to="/movies"
              className="text-lg font-semibold transition hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              to="/series"
              className="text-lg font-semibold transition hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Series
            </Link>
            <button
              onClick={() => {
                logoutHandle();
                setIsMenuOpen(false);
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-lg font-semibold transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow p-4 md:p-10">{children}</main>

      {/* Footer */}
      <footer className="mt-auto bg-[#1f1f1f] py-4 text-center text-sm text-gray-400 md:text-base">
        © {new Date().getFullYear()} BuzzShot. All rights reserved.
      </footer>
    </div>
  );
};

export default Page;
