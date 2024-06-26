import { internalServerError, Result } from "./result.ts";

export class Mediator {
    public send() {
    }

    public publish() {
    }
}

export type HandlerType<TRequest, TResponse> = (
    request: TRequest,
) => Promise<Result<TResponse>>;

export function baseHandler<TRequest, TResponse>(
    handler: HandlerType<TRequest, TResponse>,
) {
    return async (request: TRequest) => {
        try {
            return await handler(request);
        } catch (_) {
            return internalServerError();
        }
    };
}
