import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Page = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
      <nav className="flex items-center justify-between bg-[#1f1f1f] px-8 py-4 shadow-md">
        <div className="flex space-x-6 text-lg font-semibold">
          <a href="/movies" className="transition hover:text-gray-300">
            Movies
          </a>
          <a href="/series" className="transition hover:text-gray-300">
            Series
          </a>
        </div>

        <div>
          <button
            onClick={logoutHandle}
            className="rounded-md bg-red-600 px-4 py-2 transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow p-10">{children}</main>

      {/* Footer */}
      <footer className="mt-auto bg-[#1f1f1f] py-4 text-center text-gray-400">
        © {new Date().getFullYear()} BuzzShot. All rights reserved.
      </footer>
    </div>
  );
};

export default Page;
