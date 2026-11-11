export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly code = 'error',
  ) {
    super(message);
  }
}

export const badRequest = (message: string, code = 'bad_request') =>
  new HttpError(400, message, code);
export const unauthorized = (message = 'Faça login para continuar.') =>
  new HttpError(401, message, 'unauthorized');
export const forbidden = (message: string) => new HttpError(403, message, 'forbidden');
export const notFound = (message = 'Recurso não encontrado.') =>
  new HttpError(404, message, 'not_found');
export const conflict = (message: string, code = 'conflict') => new HttpError(409, message, code);
