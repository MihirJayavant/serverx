import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { convertSelector } from "./filters.ts";

const convertSelectorTest = describe(convertSelector.name);

it(convertSelectorTest, "should convert selector with single field", () => {
  const input = ["name"];
  const output: Record<string, 1> = { name: 1 };
  const result = convertSelector(input);
  assertEquals(result, output);
});

it(convertSelectorTest, "should convert selector with multiple fields", () => {
  const input = ["name", "age"];
  const output: Record<string, 1> = { name: 1, age: 1 };
  const result = convertSelector(input);
  assertEquals(result, output);
});

it(convertSelectorTest, "should handle empty input", () => {
  const input: string[] = [];
  const output = {};
  const result = convertSelector(input);
  assertEquals(result, output);
});

it(convertSelectorTest, "should handle nested fields", () => {
  const input = ["address.city"];
  const output: Record<string, 1> = { "address.city": 1 };
  const result = convertSelector(input);
  assertEquals(result, output);
});
