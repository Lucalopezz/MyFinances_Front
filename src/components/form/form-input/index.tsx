"use client";

import { useId } from "react";
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
  // O ID por instância liga rótulo e erro ao campo sem colidir entre formulários.
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-[#1F2937] dark:text-gray-300">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        type={type}
        className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        {...register}
      />
      {error && <p id={`${id}-error`} className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
