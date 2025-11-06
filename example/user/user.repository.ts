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
  ];

  getUserById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  getAllUsers(): User[] {
    return this.users;
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  deleteUser(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length < initialLength;
  }
}

export const userRepository = new UserRepository();
