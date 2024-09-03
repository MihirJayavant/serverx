export type VirtualEntity<T> = {
  readonly data?: T;
  onCreate: (id: number | string) => Promise<void>;
  onSave: () => Promise<void>;
};

export type CreatedVirtualEntity<TData, TEntity extends VirtualEntity<TData>> =
  Omit<TEntity, "onCreate">;

export async function createVirtualEntity<
  TData,
  TEntity extends VirtualEntity<TData>,
>(
  id: number | string,
  virtualEntity: TEntity,
): Promise<CreatedVirtualEntity<TData, TEntity>> {
  await virtualEntity.onCreate(id);
  return virtualEntity;
}
