export function getErrorMessage(error: unknown): string {
  const candidate = error as {
    error?: { message?: string };
    message?: string;
    name?: string;
  };

  if (candidate?.name === 'TimeoutError') {
    return 'La carga tardo demasiado. Revisa que el backend este disponible.';
  }

  return (
    candidate?.error?.message ??
    candidate?.message ??
    'Ocurrio un error inesperado'
  );
}
