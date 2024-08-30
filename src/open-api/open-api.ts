import { HttpMethod } from "../http/methods.ts";

export type ApiDocs = {
    path: string;
    description: string;
    method: HttpMethod;
    responses: Record<string, unknown>;
};

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type AddAction = Optional<ApiDocs, "description" | "responses"> & {
    basePath?: string;
};

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
            description: action.description ?? "",
            responses: action.responses ?? {},
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
                description: doc.description,
                responses: doc.responses,
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
