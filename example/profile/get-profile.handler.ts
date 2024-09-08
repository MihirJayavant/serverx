import { errorResult, successResult } from "../../src/http/result.ts";
import { baseHandler } from "../../src/index.ts";

type Input = {
    id: number;
};

type Output = {
    name: string;
};

const database = [{ id: 1, name: "Peter Pan" }, { id: 2, name: "Mac Milan" }];

function handler(input: Input) {
    const data = database.find((d) => d.id === input.id);
    if (!data) {
        return errorResult(404, "User not found");
    }
    return successResult<Output>(data);
}

export const getProfileHandler = baseHandler({
    handler,
});
