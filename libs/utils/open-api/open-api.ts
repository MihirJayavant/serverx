import type { OptionalExcept, Prettify } from "../utility.types.ts";
import type { HttpMethod } from "../result/methods.ts";

/**
 * Its Open api documentation type.
 */
export type ApiDocs = {
  path: string;
  description: string;
  method: HttpMethod;
  tags: string[];
  parameters: Record<string, unknown>[];
  requestBody: Record<string, unknown>;
  responses: Record<string, unknown>;
};

type AddAction = Prettify<
  OptionalExcept<ApiDocs, "path" | "method"> & {
    basePath?: string;
  }
>;

/**
 * Its Open api ui option.
 */
export type OpenApiUiOption = {
  url: string;
  openapi: string;
  info: {
    version: string;
    title: string;
  };
};

/**
 * Its Open api class to genearate open api documentation in json format
 */
export class OpenApi {
  readonly #docs: ApiDocs[] = [];

  addAction(action: AddAction) {
    this.#docs.push({
      method: action.method,
      path: this.convertPath(
        `${action.basePath ?? ""}${this.filterPathName(action.path)}`,
      ),
      tags: action.tags ?? [],
      description: action.description ?? "",
      parameters: action.parameters ?? [],
      responses: action.responses ?? {},
      requestBody: action.requestBody ?? {},
    });
  }

  addSubOpenApi(
    subRoute: { route: string; openApi: OpenApi; basePath?: string },
  ) {
    const docs = subRoute.openApi.#docs.map((p) => ({
      ...p,
      path: this.convertPath(`${subRoute.basePath ?? ""}${p.path}`),
    }));
    this.#docs.push(...docs);
  }

  private filterPathName(path: string) {
    return path === "/" ? "" : path;
  }

  private formatOpenApiPath() {
    // deno-lint-ignore no-explicit-any
    const paths: any = {};
    for (const doc of this.#docs) {
      if (!paths[doc.path]) {
        paths[doc.path] = {};
      }

      paths[doc.path][doc.method.toLowerCase()] = {
        ...doc,
      };
    }
    return paths;
  }

  getOpenApiJsonDoc(
    options: OpenApiUiOption,
    // deno-lint-ignore no-explicit-any
  ): Omit<OpenApiUiOption, "url"> & { paths: any } {
    return {
      openapi: options.openapi,
      info: options.info,
      paths: this.formatOpenApiPath(),
    };
  }

  private convertPath(path: string): string {
    return path.replace(/:([^\/]+)/g, "{$1}");
  }
}
