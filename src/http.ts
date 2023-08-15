import fetch, { RequestInit, Response } from 'node-fetch'

export class Http {
  static async get<T>(url: string, init?: RequestInit | undefined): Promise<T> {
    const res = await fetch(url, init)
    this.checkStatus(res)
    return (await res.json()) as Promise<T>
  }
  static async post<T>(url: string, body: T, init?: RequestInit | undefined) {
    const res = await fetch(url, { body, ...init })
    this.checkStatus(res)
    return await res.json()
  }
  static async put(url: string, init?: RequestInit | undefined) {
    const res = await fetch(url, init)
    this.checkStatus(res)
    return await res.json()
  }
  static async delete(url: string, init?: RequestInit | undefined) {
    const res = await fetch(url, init)
    this.checkStatus(res)
    return await res.json()
  }
  static checkStatus(response: Response) {
    if (response.ok) {
      return response
    } else {
      throw new HTTPResponseError(response)
    }
  }
}

export class HTTPResponseError extends Error {
  response
  constructor(response: Response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`)
    this.response = response
  }
}
