export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type OptionalExcept<T, K extends keyof T> =
  & Partial<Omit<T, K>>
  & Pick<T, K>;

export type JsonType = Record<string, never>;
