import { httpMethods } from "../../src/router.ts";

export const path = "/";

export const method = httpMethods.GET;

export const description = "Returns User Profile";

export const responses = {
    "200": {
        description: "User Profile",
        content: {
            "application/json": {
                schema: {
                    type: "array",
                    items: {
                        type: "string",
                        format: "email",
                    },
                },
            },
        },
    },
};

export function handler() {
    return Promise.resolve({
        name: "James Turner",
    });
}
