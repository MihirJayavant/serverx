/**
 * @file methods.ts
 * Constants for HTTP methods
 */

/**
 * HTTP methods
 * @property {string} GET - GET method
 * @property {string} POST - POST method
 * @property {string} PUT - PUT method
 * @property {string} PATCH - PATCH method
 * @property {string} DELETE - DELETE method
 */
export const httpMethods = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

/**
 * HTTP method type
 * @type {keyof typeof httpMethods}
 */
export type HttpMethod = keyof typeof httpMethods;
