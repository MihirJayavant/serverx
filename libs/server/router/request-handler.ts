import {
  errorResult,
  type JsonType,
  type Result,
  statusCodes,
  type Task,
} from "@serverx/utils";
import { z, type ZodAny, type ZodObject } from "@zod/zod";

export type RequestHandler<Input, Output extends JsonType> = (
  payload: Input,
) => Task<Result<Output>>;

export type BaseHandlerOption<Input, Output extends JsonType> = {
  handler: RequestHandler<Input, Output>;
  validationSchema?: ZodObject | ZodAny;
};

export function baseHandler<Input, Output extends JsonType>(
  option: BaseHandlerOption<Input, Output>,
): (input: Input) => Task<Result<Output>> {
  return (input: Input) => {
    const validation = option.validationSchema?.safeParse(input);
    if (validation?.success === false) {
      return errorResult(
        z.prettifyError(validation.error),
        statusCodes.BadRequest,
      );
    }
    return option.handler(input);
  };
}
