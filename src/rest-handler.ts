import { Context } from "@hono/hono";
import { RequestHandler } from "./request-handler.ts";
import { isSuccess } from "./http/result.ts";
import { JsonType } from "./core/utility.types.ts";

type RestHandler<Input, Output extends JsonType> = {
    handler: RequestHandler<Input, Output>;
    input: Input;
    context: Context;
};

export async function restHandler<Input, Output extends JsonType>(
    { handler, input, context }: RestHandler<Input, Output>,
) {
    try {
        const result = await handler(input);
        if (isSuccess(result)) {
            return context.json(result.data, result.status);
        } else {
            return context.json({ error: result.error }, result.status);
        }
    } catch (error: unknown) {
        return context.json({ error }, 500);
    }
}
