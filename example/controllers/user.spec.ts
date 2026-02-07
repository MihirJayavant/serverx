import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertGreater } from "@std/assert";

describe("User Controller", () => {
  const baseUrl = "http://127.0.0.1:3100";

  it("should return user for GET /user/:id", async () => {
    const getUserUrl = `${baseUrl}/user/1`;

    const response = await fetch(getUserUrl);

    assertEquals(response.status, 200);
    const data = await response.json();
    assertEquals(data, {
      id: 1,
      firstname: "Peter",
      lastname: "Pan",
      email: "peter.pan@example.com",
      age: 30,
    });
  });

  it("should return 404 for GET /user/:id for non existing user", async () => {
    const getUserUrl = `${baseUrl}/user/100`;

    const response = await fetch(getUserUrl);

    assertEquals(response.status, 404);
    const data = await response.json();
    assertEquals(data.error, "User not found");
  });

  it("should return users users for GET /user", async () => {
    const getusersUrl = `${baseUrl}/user`;

    const response = await fetch(getusersUrl);

    assertEquals(response.status, 200);
    const result = await response.json();
    assertEquals(Array.isArray(result.data), true);
    assertGreater(result.data.length, 0);
  });

  it("should return 400 for invalid page number", async () => {
    const getusersUrl = `${baseUrl}/user?page=0`;

    const response = await fetch(getusersUrl);

    assertEquals(response.status, 400);
    const result = await response.json();
    assertEquals(!!result.error, true);
  });

  it("should return 400 for non-numeric page number", async () => {
    const getusersUrl = `${baseUrl}/user?page=abc`;

    const response = await fetch(getusersUrl);

    assertEquals(response.status, 400);
    const result = await response.json();
    assertEquals(!!result.error, true);
  });
});
