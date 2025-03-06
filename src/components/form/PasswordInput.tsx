import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
}

export const PasswordInput = ({
  label,
  error,
  register,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative space-y-1">
      <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300">
        {label}
      </label>
      <input
        type={showPassword ? "text" : "password"}
        className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white pr-10"
        {...register}
      />
      <button
        type="button"
        className="absolute right-3 top-9 text-gray-500 dark:text-gray-400"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
