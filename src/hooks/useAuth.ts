"use client";
import { useAuthContext } from "@/providers/auth-provider";

export default function useAuth() {
  return useAuthContext();
}
