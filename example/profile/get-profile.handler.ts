import { successResult } from "../../src/http/result.ts";
import { baseHandler } from "../../src/index.ts";

type Output = {
    name: string;
};

function handler() {
    return successResult<Output>({
        name: "James Turner",
    });
}

export const getProfileHandler = baseHandler({
    handler,
});
