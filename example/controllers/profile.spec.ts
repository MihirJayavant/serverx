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

  it("should return users profiles for GET /profile", async () => {
    const getProfilesUrl = `${baseUrl}/profile`;

    const response = await fetch(getProfilesUrl);

    assertEquals(response.status, 200);
    const result = await response.json();
    assertEquals(Array.isArray(result.data), true);
  });

  it("should return 400 for invalid page number", async () => {
    const getProfilesUrl = `${baseUrl}/profile?page=0`;

    const response = await fetch(getProfilesUrl);

    assertEquals(response.status, 400);
    const result = await response.json();
    assertEquals(!!result.error, true);
  });

  it("should return 400 for non-numeric page number", async () => {
    const getProfilesUrl = `${baseUrl}/profile?page=abc`;

    const response = await fetch(getProfilesUrl);

    assertEquals(response.status, 400);
    const result = await response.json();
    assertEquals(!!result.error, true);
  });
});
