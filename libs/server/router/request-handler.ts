import {
  errorResult,
  type JsonType,
  type Result,
  statusCodes,
  type Task,
} from "@serverx/utils";
import { z, type ZodAny, type ZodObject } from "@zod/zod";

/**
 * A business-logic handler that maps a typed input to a {@link Result}.
 *
 * @typeParam Input - The input payload type.
 * @typeParam Output - The success payload type.
 */
export type RequestHandler<Input, Output extends JsonType> = (
  payload: Input,
) => Task<Result<Output>>;

/**
 * Configuration for {@link baseHandler}.
 *
 * @typeParam Input - The input payload type.
 * @typeParam Output - The success payload type.
 */
export type BaseHandlerOption<Input, Output extends JsonType> = {
  /** The handler invoked once validation passes. */
  handler: RequestHandler<Input, Output>;
  /** Optional Zod schema validating the input before the handler runs. */
  validationSchema?: ZodObject | ZodAny;
};

/**
 * Wrap a {@link RequestHandler} with optional Zod validation. When the schema
 * rejects the input, returns a `400 Bad Request` {@link Result} with the
 * formatted validation error; otherwise delegates to the handler.
 */
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
