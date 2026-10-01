export const selectClass =
  "mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900";
export const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Não foi possível salvar. Tente novamente.";

export function FormErrors({ errors }: { errors: (string | undefined)[] }) {
  return (
    <div role="alert" className="text-sm text-red-600">
      {errors.filter(Boolean).map((error, index) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  );
}
