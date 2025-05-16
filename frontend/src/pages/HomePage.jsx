import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const HomePage = () => {
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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
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

      <main className="p-10">
        <h1 className="mb-4 text-3xl font-bold">Welcome to BuzzShot</h1>
        <p className="text-gray-400">Select a category to start exploring!</p>
      </main>
    </div>
  );
};

export default HomePage;
