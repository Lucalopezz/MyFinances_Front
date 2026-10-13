import { z } from "zod";

/** Padroniza validações de formulários; mensagens específicas dos schemas prevalecem. */
export const portugueseErrorMap: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return {
        message:
          issue.received === "undefined"
            ? "Preencha este campo."
            : issue.expected === "number"
              ? "Informe um número válido."
              : "Confira o valor informado.",
      };
    case "too_small":
      return {
        message:
          issue.type === "string"
            ? `Use pelo menos ${issue.minimum} caracteres.`
            : `Informe um valor ${issue.inclusive ? "maior ou igual a" : "maior que"} ${issue.minimum}.`,
      };
    case "too_big":
      return {
        message:
          issue.type === "string"
            ? `Use no máximo ${issue.maximum} caracteres.`
            : `Informe um valor de até ${issue.maximum}.`,
      };
    case "invalid_string":
      return {
        message:
          issue.validation === "email"
            ? "Informe um e-mail válido."
            : "Confira o formato informado.",
      };
    case "invalid_enum_value":
      return { message: "Selecione uma opção válida." };
    case "invalid_date":
      return { message: "Informe uma data válida." };
    case "not_multiple_of":
      return { message: "Use no máximo duas casas decimais." };
    default:
      return { message: "Confira o valor informado." };
  }
};
// O mapa é aplicado antes de resolver os formulários nas páginas públicas e privadas.
z.setErrorMap(portugueseErrorMap);
