export const paths = {
    "/pets": {
        "get": {
            "description":
                "Returns all pets from the system that the user has access to",
            "responses": {
                "200": {
                    "description": "A list of pets.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "type": "string",
                                    "format": "email",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
