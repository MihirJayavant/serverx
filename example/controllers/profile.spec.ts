import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";

describe("Profile Controller", () => {
  const baseUrl = "http://127.0.0.1:3100";

  it("should return user profile for GET /profile/:id", async () => {
    const getUserUrl = `${baseUrl}/profile/1`;

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
});
