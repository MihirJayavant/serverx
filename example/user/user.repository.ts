import { User } from "./user.ts";

class UserRepository {
  private users: User[] = [
    {
      id: 1,
      firstname: "Peter",
      lastname: "Pan",
      email: "peter.pan@example.com",
      age: 30,
    },
    {
      id: 2,
      firstname: "Mac",
      lastname: "Milan",
      email: "mac.milan@example.com",
      age: 25,
    },
    {
      id: 3,
      firstname: "Alice",
      lastname: "Smith",
      email: "alice.smith@example.com",
      age: 28,
    },
    {
      id: 4,
      firstname: "Bob",
      lastname: "Jones",
      email: "bob.jones@example.com",
      age: 35,
    },
    {
      id: 5,
      firstname: "Charlie",
      lastname: "Brown",
      email: "charlie.brown@example.com",
      age: 22,
    },
    {
      id: 6,
      firstname: "Diana",
      lastname: "Prince",
      email: "diana.prince@example.com",
      age: 29,
    },
    {
      id: 7,
      firstname: "Edward",
      lastname: "Norton",
      email: "edward.norton@example.com",
      age: 42,
    },
    {
      id: 8,
      firstname: "Fiona",
      lastname: "Gallagher",
      email: "fiona.gallagher@example.com",
      age: 26,
    },
    {
      id: 9,
      firstname: "George",
      lastname: "Costanza",
      email: "george.costanza@example.com",
      age: 38,
    },
    {
      id: 10,
      firstname: "Hannah",
      lastname: "Baker",
      email: "hannah.baker@example.com",
      age: 21,
    },
  ];

  getUserById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  getAllUsers(input: { offset: number; limit: number }): User[] {
    return this.users.slice(input.offset, input.offset + input.limit);
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  updateUser(user: User): void {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  deleteUser(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length < initialLength;
  }
}

export const userRepository = new UserRepository();
