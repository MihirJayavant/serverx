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
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                        },
                    },
                    "required": ["name"],
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
