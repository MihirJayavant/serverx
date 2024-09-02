import { httpMethods } from "../../src/http/methods.ts";

export const tags = ["user"];
export const path = "/";

export const method = httpMethods.GET;

export const description = "Returns User Profile";

export function handler() {
    return Promise.resolve([{
        name: "James Turner",
    }, {
        name: "Joe Turner",
    }]);
}

export const responses = {
    "200": {
        description: "User Profile",
        content: {
            "application/json": {
                schema: {
                    type: "array",
                    items: {
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
    },
};
