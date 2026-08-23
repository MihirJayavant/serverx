/**
 * @file virtual-entity.ts
 * Entities whose persistence is driven by lifecycle hooks
 */

/**
 * An entity whose persistence lifecycle is driven by explicit hooks rather
 * than direct mutation.
 *
 * @typeParam T - The underlying data carried by the entity.
 *
 * @example
 * ```ts
 * const user: VirtualEntity<User> = {
 *   data: undefined,
 *   onCreate: async (id) => { user.data = await repository.insert(id, draft); },
 *   onSave: async () => { await repository.update(user.data!); },
 * };
 * ```
 */
export type VirtualEntity<T> = {
  /** The entity's current data, once available. */
  readonly data?: T;
  /** Invoked when the entity is created with its assigned identifier. */
  onCreate: (id: number | string) => Promise<void>;
  /** Persist the entity's current state. */
  onSave: () => Promise<void>;
};

/**
 * A {@link VirtualEntity} that has completed creation — the `onCreate` hook is
 * omitted because it has already run.
 */
export type CreatedVirtualEntity<TData, TEntity extends VirtualEntity<TData>> =
  Omit<TEntity, "onCreate">;

/**
 * Run a {@link VirtualEntity}'s `onCreate` hook with the given identifier and
 * return the entity as a {@link CreatedVirtualEntity}.
 *
 * @param id - The identifier assigned to the newly created entity.
 * @param virtualEntity - The entity whose `onCreate` hook should run.
 *
 * @example
 * ```ts
 * const created = await createVirtualEntity(newId, user);
 * await created.onSave(); // `onCreate` is no longer callable
 * ```
 */
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
