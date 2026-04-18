import { jest } from "@jest/globals";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUserFindOne = jest.fn();
const mockUserFindOneAndUpdate = jest.fn();

jest.unstable_mockModule("../models/user.js", () => ({
  default: {
    findOne: mockUserFindOne,
    findOneAndUpdate: mockUserFindOneAndUpdate,
  },
}));

// ─── Import controller after mocks ───────────────────────────────────────────

const {
  getUserPreferences,
  updateUserPreferences,
  getPreferencesSummary,
  clearUserPreferences,
} = await import("../controllers/userPreferencesController.js");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = {
  username: "chef_mario",
  name: "Mario",
  dietaryPreferences: ["Vegan", "Gluten-Free"],
  allergies: ["Peanuts"],
  customPreferences: ["No mushrooms"],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

// =============================================================================
// getUserPreferences
// =============================================================================
describe("getUserPreferences", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = { params: { userId: "ghost-uid" } };
    const res = makeMockRes();

    await getUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("returns all three preference arrays with 200", async () => {
    mockUserFindOne.mockResolvedValue(mockUser);
    const req = { params: { userId: "firebase-uid-001" } };
    const res = makeMockRes();

    await getUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      dietaryPreferences: ["Vegan", "Gluten-Free"],
      allergies: ["Peanuts"],
      customPreferences: ["No mushrooms"],
    });
  });

  test("returns empty arrays when user has no preferences set", async () => {
    mockUserFindOne.mockResolvedValue({ dietaryPreferences: undefined, allergies: undefined, customPreferences: undefined });
    const req = { params: { userId: "firebase-uid-001" } };
    const res = makeMockRes();

    await getUserPreferences(req, res);

    expect(res.json).toHaveBeenCalledWith({
      dietaryPreferences: [],
      allergies: [],
      customPreferences: [],
    });
  });

  test("returns 500 on database error", async () => {
    mockUserFindOne.mockRejectedValue(new Error("DB error"));
    const req = { params: { userId: "firebase-uid-001" } };
    const res = makeMockRes();

    await getUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// =============================================================================
// updateUserPreferences
// =============================================================================
describe("updateUserPreferences", () => {
  const validBody = {
    dietaryPreferences: ["Vegan"],
    allergies: ["Peanuts"],
    customPreferences: ["No mushrooms"],
  };

  test("returns 400 when any preference field is not an array", async () => {
    const req = {
      params: { userId: "firebase-uid-001" },
      body: { dietaryPreferences: "Vegan", allergies: [], customPreferences: [] },
    };
    const res = makeMockRes();

    await updateUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("arrays") })
    );
    expect(mockUserFindOneAndUpdate).not.toHaveBeenCalled();
  });

  test("returns 400 when allergies field is missing (not an array)", async () => {
    const req = {
      params: { userId: "firebase-uid-001" },
      body: { dietaryPreferences: [], allergies: null, customPreferences: [] },
    };
    const res = makeMockRes();

    await updateUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updates preferences and returns 200 on success", async () => {
    mockUserFindOneAndUpdate.mockResolvedValue({ ...mockUser, ...validBody });
    const req = { params: { userId: "firebase-uid-001" }, body: validBody };
    const res = makeMockRes();

    await updateUserPreferences(req, res);

    expect(mockUserFindOneAndUpdate).toHaveBeenCalledWith(
      { firebaseUid: "firebase-uid-001" },
      expect.objectContaining({ dietaryPreferences: ["Vegan"] }),
      expect.objectContaining({ new: true, upsert: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Preferences updated successfully" })
    );
  });

  test("returns 500 on database error", async () => {
    mockUserFindOneAndUpdate.mockRejectedValue(new Error("DB error"));
    const req = { params: { userId: "firebase-uid-001" }, body: validBody };
    const res = makeMockRes();

    await updateUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// =============================================================================
// getPreferencesSummary
// =============================================================================
describe("getPreferencesSummary", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const req = { params: { userId: "ghost-uid" } };
    const res = makeMockRes();

    await getPreferencesSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("returns summary with correct counts and arrays", async () => {
    mockUserFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const req = { params: { userId: "firebase-uid-001" } };
    const res = makeMockRes();

    await getPreferencesSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "chef_mario",
        name: "Mario",
        preferences: expect.objectContaining({
          dietaryCount: 2,
          allergiesCount: 1,
          customCount: 1,
        }),
      })
    );
  });
});

// =============================================================================
// clearUserPreferences
// =============================================================================
describe("clearUserPreferences", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOneAndUpdate.mockResolvedValue(null);
    const req = { params: { userId: "ghost-uid" } };
    const res = makeMockRes();

    await clearUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("clears all preferences and returns 200 with empty arrays", async () => {
    mockUserFindOneAndUpdate.mockResolvedValue({
      ...mockUser,
      dietaryPreferences: [],
      allergies: [],
      customPreferences: [],
    });
    const req = { params: { userId: "firebase-uid-001" } };
    const res = makeMockRes();

    await clearUserPreferences(req, res);

    expect(mockUserFindOneAndUpdate).toHaveBeenCalledWith(
      { firebaseUid: "firebase-uid-001" },
      { dietaryPreferences: [], allergies: [], customPreferences: [] },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        preferences: { dietaryPreferences: [], allergies: [], customPreferences: [] },
      })
    );
  });

  test("returns 500 on database error", async () => {
    mockUserFindOneAndUpdate.mockRejectedValue(new Error("DB error"));
    const req = { params: { userId: "firebase-uid-001" } };
    const res = makeMockRes();

    await clearUserPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});