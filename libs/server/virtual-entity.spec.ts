import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createVirtualEntity, type VirtualEntity } from "./virtual-entity.ts";

type User = { name: string };

function userEntity(
  onCreate: (id: number | string) => Promise<void> = () => Promise.resolve(),
): VirtualEntity<User> {
  return {
    data: { name: "John Doe" },
    onCreate,
    onSave: () => Promise.resolve(),
  };
}

const createVirtualEntityTest = describe(createVirtualEntity.name);

it(
  createVirtualEntityTest,
  "should call onCreate with a number id",
  async () => {
    const ids: (number | string)[] = [];
    await createVirtualEntity(
      1,
      userEntity((id) => {
        ids.push(id);
        return Promise.resolve();
      }),
    );
    assertEquals(ids, [1]);
  },
);

it(
  createVirtualEntityTest,
  "should call onCreate with a string id",
  async () => {
    const ids: (number | string)[] = [];
    await createVirtualEntity(
      "user-1",
      userEntity((id) => {
        ids.push(id);
        return Promise.resolve();
      }),
    );
    assertEquals(ids, ["user-1"]);
  },
);

it(createVirtualEntityTest, "should return the same entity", async () => {
  const entity = userEntity();
  const created = await createVirtualEntity(1, entity);
  assertStrictEquals(created, entity);
  assertEquals(created.data, { name: "John Doe" });
});

it(createVirtualEntityTest, "should reject when onCreate rejects", async () => {
  const entity = userEntity(() => Promise.reject(new Error("create failed")));
  await assertRejects(
    () => createVirtualEntity(1, entity),
    Error,
    "create failed",
  );
});
