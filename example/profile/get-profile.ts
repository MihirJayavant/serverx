import { HttpMethod } from "../../src/router.ts";

export const path = "/";

export const method = HttpMethod.GET;

export function handler() {
    return Promise.resolve({
        name: "James Turner",
    });
}
