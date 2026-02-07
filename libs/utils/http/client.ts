/**
 * @file client.ts
 * HttpClient class that wraps fetch functionality
 */

import { httpMethods } from "../result/methods.ts";

/**
 * Options for the HttpClient
 */
export interface HttpClientOptions {
  /** Base URL for all requests */
  baseUrl: string;
  /** Default headers to be included in all requests */
  headers?: Record<string, string>;
}

/**
 * HttpClient class that wraps fetch functionality for modern REST APIs with JSON content.
 *
 * This class provides a standardized way to interact with JSON-based REST APIs,
 * returning a Result type for consistent error handling.
 */
export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  /**
   * @param options - Configuration options for the client
   */
  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    };
  }

  /**
   * Helper to perform the actual fetch request
   * @param method - HTTP method
   * @param urlPath - Path or full URL
   * @param body - Request body
   * @param options - Additional fetch options
   * @returns Result wrapped response
   */
  private async request<T>(
    method: string,
    urlPath: string,
    body?: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    // Construct full URL
    const url = new URL(urlPath, this.baseUrl ?? undefined).toString();

    const headers = { ...this.defaultHeaders, ...options.headers };

    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body: (body && (method !== "GET" && method !== "DELETE"))
        ? JSON.stringify(body)
        : undefined,
    });

    const status = response.status;

    // Handle 204 No Content
    if (status === 204) {
      return undefined as T;
    }

    return await response.json();
  }

  /**
   * GET request
   * @param path - URL path
   * @param options - Request options
   */
  get<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    return this.request(httpMethods.GET, path, undefined, options);
  }

  /**
   * POST request
   * @param path - URL path
   * @param body - Request body
   * @param options - Request options
   */
  post<T, U>(
    path: string,
    body?: T,
    options?: RequestInit,
  ): Promise<U> {
    return this.request(httpMethods.POST, path, body, options);
  }

  /**
   * PUT request
   * @param path - URL path
   * @param body - Request body
   * @param options - Request options
   */
  put<T, U>(
    path: string,
    body?: T,
    options?: RequestInit,
  ): Promise<U> {
    return this.request(httpMethods.PUT, path, body, options);
  }

  /**
   * PATCH request
   * @param path - URL path
   * @param body - Request body
   * @param options - Request options
   */
  patch<T>(
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request(httpMethods.PATCH, path, body, options);
  }

  /**
   * DELETE request
   * @param path - URL path
   * @param options - Request options
   */
  delete<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    return this.request(httpMethods.DELETE, path, undefined, options);
  }
}
