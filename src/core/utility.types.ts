export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type OptionalExcept<T, K extends keyof T> =
  & Partial<Omit<T, K>>
  & Pick<T, K>;

export type JsonType = {
  [x: string]:
    | string
    | boolean
    | boolean
    | null
    | undefined
    | JsonType
    | JsonArray;
};

export type JsonArray = Array<JsonType>;

export type Task<T> = T | Promise<T>;
