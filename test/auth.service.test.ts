import AuthService from "@/service/auth.service";

jest.mock("@/repository/user.repository", () => ({
  __esModule: true,
  default: {
    getByEmail: jest.fn((email: string) => {
      if (email === "admin@mail.com") {
        return Promise.resolve({
          id_user: 1,
          email_user: "admin@mail.com",
          password_user: "password123", // simulamos hash
        });
      }
      return null;
    }),
  },
}));

jest.mock("@/common/security/security-factory", () => ({
  SecurityFactory: {
    makePasswordHasher: jest.fn(() => ({
      compare: jest.fn((plain: string, hashed: string) =>
        Promise.resolve(plain === hashed),
      ),
      hash: jest.fn((plain: string) => Promise.resolve("hashed-" + plain)),
    })),
    makeJwtStrategy: jest.fn(() => ({
      sign: jest.fn(() => "fake-jwt-token"),
      verify: jest.fn(() => ({ id: 1, email: "admin@mail.com" })),
    })),
  },
}));

describe("AuthService", () => {
  it("should return a JWT token for valid credentials", async () => {
    const result = await AuthService.login("admin@mail.com", "password123");
    expect(result).toHaveProperty("token");
    expect(result.token).toBe("fake-jwt-token");
  });

  it("should throw error for invalid credentials", async () => {
    await expect(
      AuthService.login("wrong@mail.com", "badpass"),
    ).rejects.toThrow("Invalid credentials");
  });
});
