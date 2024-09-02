import { HttpMethod } from "../http/methods.ts";

export type ApiDocs = {
    path: string;
    description: string;
    method: HttpMethod;
    tags: [];
    parameters: unknown[];
    requestBody: Record<string, unknown>;
    responses: Record<string, unknown>;
};

type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

type AsOneType<T> = {
    [K in keyof T]: T[K];
};

type AddAction = AsOneType<
    OptionalExcept<ApiDocs, "path" | "method"> & {
        basePath?: string;
    }
>;

export type OpenApiUiOption = {
    url: string;
    openapi: string;
    info: {
        version: string;
        title: string;
    };
};

export class OpenApi {
    readonly #docs: ApiDocs[] = [];

    addAction(action: AddAction) {
        this.#docs.push({
            method: action.method,
            path: `${action.basePath ?? ""}${this.filterPathName(action.path)}`,
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
            path: `${subRoute.basePath ?? ""}${p.path}`,
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

    getOpenApiJsonDoc(options: OpenApiUiOption) {
        return {
            openapi: options.openapi,
            info: options.info,
            paths: this.formatOpenApiPath(),
        };
    }
}
