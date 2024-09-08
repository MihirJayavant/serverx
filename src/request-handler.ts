import type { JsonType, Task } from "./core/utility.types.ts";
import { errorResult, type Result, statusCodes } from "./http/result.ts";
import type { AnyZodObject } from "@zod/zod";

export type RequestHandler<Input, Output extends JsonType> = (
  payload: Input,
) => Task<Result<Output>>;

export type BaseHandlerOption<Input, Output extends JsonType> = {
  handler: RequestHandler<Input, Output>;
  validationSchema?: AnyZodObject;
};

export function baseHandler<Input, Output extends JsonType>(
  option: BaseHandlerOption<Input, Output>,
): (input: Input) => Task<Result<Output>> {
  return (input: Input) => {
    const validation = option.validationSchema?.safeParse(input);
    if (validation && validation.success === false) {
      return errorResult(statusCodes.BadRequest, validation.error.message);
    }
    return option.handler(input);
  };
}
