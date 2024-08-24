import { httpMethods } from "../../src/router.ts";

export const path = "/";

export const method = httpMethods.GET;

export function handler() {
    return Promise.resolve({
        name: "James Turner",
    });
}
