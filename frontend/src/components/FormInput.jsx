import React from "react";

const FormInput = ({ label, type, value, onChange, name }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        name={name}
      />
    </div>
  );
};

export default FormInput;
