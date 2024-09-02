export type RequestHandler<Input, Output> = (payload: Input) => Promise<Output>;
