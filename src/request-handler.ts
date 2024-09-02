import { JsonType } from "./core/utility.types.ts";
import { Result } from "./http/result.ts";

export type RequestHandler<Input, Output extends JsonType> = (
    payload: Input,
) => Promise<Result<Output>>;
