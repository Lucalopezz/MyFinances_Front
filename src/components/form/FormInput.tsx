import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
  label: string;
  type?: string;
  error?: string;
  register: UseFormRegisterReturn;
}

export const FormInput = ({
  label,
  type = "text",
  error,
  register,
}: FormInputProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[#1F2937] dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        {...register}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
