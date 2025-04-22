import { z } from "zod";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(50, "Máximo 50 caracteres")
      .optional(),
    password: z.preprocess((val) => {
      if (typeof val === "string" && val.trim() === "") return undefined;
      return val;
    }, z.string().min(8, "Mínimo 8 caracteres").max(128, "Máximo 128 caracteres").optional()),
    confirmPassword: z.preprocess((val) => {
      if (typeof val === "string" && val.trim() === "") return undefined;
      return val;
    }, z.string().optional()),
  })
  .superRefine((data, ctx) => {
    // Se o usuário informar password, confirmPassword é obrigatório e deve bater
    if (data.password !== undefined) {
      if (data.confirmPassword === undefined) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: "Confirmação de senha é obrigatória",
        });
      } else if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: "As senhas não conferem",
        });
      }
    }
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
