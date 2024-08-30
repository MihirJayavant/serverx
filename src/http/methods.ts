export const httpMethods = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
} as const;

export type HttpMethod = keyof typeof httpMethods;
