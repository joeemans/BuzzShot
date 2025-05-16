import React from "react";

const AuthBox = ({ title, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default AuthBox;
