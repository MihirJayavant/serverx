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

  it("should create a user for POST /user", async () => {
    const userId = 99;
    const userUrl = `${baseUrl}/user`;
    const specificUserUrl = `${baseUrl}/user/${userId}`;

    // Cleanup before test to ensure idempotency
    await fetch(specificUserUrl, { method: "DELETE" }).then((res) =>
      res.arrayBuffer()
    );

    const newUser = {
      id: userId,
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      age: 25,
    };

    const response = await fetch(userUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    assertEquals(response.status, 201);
    const data = await response.json();
    assertEquals(data, newUser);
  });

  it("should update a user for PUT /user/:id", async () => {
    const userId = 99;
    const specificUserUrl = `${baseUrl}/user/${userId}`;

    // Ensure user exists (idempotent setup)
    const user = {
      id: userId,
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      age: 25,
    };

    // Try to create, ignore if already exists
    await fetch(`${baseUrl}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }).then((res) => res.arrayBuffer());

    const updatedUser = { ...user, firstname: "Johnny" };

    const response = await fetch(specificUserUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    assertEquals(response.status, 200);
    const data = await response.json();
    assertEquals(data, updatedUser);
  });

  it("should delete a user for DELETE /user/:id", async () => {
    const userId = 100;
    const specificUserUrl = `${baseUrl}/user/${userId}`;

    // Ensure user exists
    await fetch(`${baseUrl}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        firstname: "To",
        lastname: "Delete",
        email: "delete@example.com",
        age: 30,
      }),
    }).then((res) => res.arrayBuffer());

    const response = await fetch(specificUserUrl, { method: "DELETE" });

    assertEquals(response.status, 200);
    const data = await response.json();
    assertEquals(data.success, true);
    assertEquals(data.message, "User deleted successfully");

    // Verify it's gone
    const getResponse = await fetch(specificUserUrl);
    assertEquals(getResponse.status, 404);
    await getResponse.arrayBuffer();
  });
});
