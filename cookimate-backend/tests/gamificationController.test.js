import { jest } from "@jest/globals";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUserFindById = jest.fn();
jest.unstable_mockModule("../models/user.js", () => ({
  default: { findById: mockUserFindById },
}));

const mockGamificationFindOne = jest.fn();
const mockGamificationFind = jest.fn();
jest.unstable_mockModule("../models/GamificationLevel.js", () => ({
  default: {
    findOne: mockGamificationFindOne,
    find: jest.fn().mockReturnValue({ sort: mockGamificationFind }),
  },
}));

const mockUpdateUserStats = jest.fn();
jest.unstable_mockModule("../utils/gamificationHelpers.js", () => ({
  updateUserStats: mockUpdateUserStats,
}));

// ─── Import controller after mocks ───────────────────────────────────────────

const { recordAction, getUserDashboard, getAllGamificationLevels } =
  await import("../controllers/gamificationController.js");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

// =============================================================================
// recordAction
// =============================================================================
describe("recordAction", () => {
  const mockUser = {
    level: 2,
    recipesCookedCount: 5,
    favorites: ["r1", "r2"],
    postsShared: 3,
    likesReceived: 10,
    aiGenerations: 1,
    mealPlan: ["m1"],
  };

  const mockLevel = { levelName: "Home Cook" };

  test("returns 400 for an invalid action", async () => {
    const req = { params: { userId: "uid-001" }, body: { action: "INVALID_ACTION" } };
    const res = makeMockRes();

    await recordAction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid action" });
    expect(mockUpdateUserStats).not.toHaveBeenCalled();
  });

  test("records a valid action and returns 200 with stats", async () => {
    mockUpdateUserStats.mockResolvedValue(mockUser);
    mockGamificationFindOne.mockResolvedValue(mockLevel);

    const req = { params: { userId: "uid-001" }, body: { action: "COOK_RECIPE" } };
    const res = makeMockRes();

    await recordAction(req, res);

    expect(mockUpdateUserStats).toHaveBeenCalledWith("uid-001", "COOK_RECIPE");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Action recorded successfully",
        currentLevel: 2,
        levelName: "Home Cook",
        stats: expect.objectContaining({ recipesCooked: 5 }),
      })
    );
  });

  test("accepts all valid action types without returning 400", async () => {
    const validActions = [
      "COOK_RECIPE", "SAVE_FAVORITE", "SHARE_POST",
      "RECEIVE_LIKE", "USE_AI", "PLAN_MEAL", "DAILY_LOGIN",
    ];
    mockUpdateUserStats.mockResolvedValue(mockUser);
    mockGamificationFindOne.mockResolvedValue(mockLevel);

    for (const action of validActions) {
      const req = { params: { userId: "uid-001" }, body: { action } };
      const res = makeMockRes();
      await recordAction(req, res);
      expect(res.status).not.toHaveBeenCalledWith(400);
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(() => {});
    }
  });

  test("falls back to 'Rookie' when no gamification level is found", async () => {
    mockUpdateUserStats.mockResolvedValue(mockUser);
    mockGamificationFindOne.mockResolvedValue(null);

    const req = { params: { userId: "uid-001" }, body: { action: "USE_AI" } };
    const res = makeMockRes();

    await recordAction(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ levelName: "Rookie" })
    );
  });

  test("returns 500 when updateUserStats throws", async () => {
    mockUpdateUserStats.mockRejectedValue(new Error("DB failure"));

    const req = { params: { userId: "uid-001" }, body: { action: "COOK_RECIPE" } };
    const res = makeMockRes();

    await recordAction(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB failure" });
  });
});

// =============================================================================
// getUserDashboard
// =============================================================================
describe("getUserDashboard", () => {
  const mockUser = {
    level: 2,
    recipesCookedCount: 8,
    favorites: ["r1", "r2", "r3"],
    postsShared: 4,
    likesReceived: 12,
    aiGenerations: 2,
    mealPlan: ["m1", "m2"],
  };

  // Level 1 requirements (to be subtracted as offset) and level 2 requirements (current targets)
  const mockLevels = [
    {
      levelNumber: 1,
      levelName: "Rookie",
      requirements: {
        cookRecipes: 3,
        saveFavorites: 2,
        sharePosts: 1,
        getLikes: 5,
        useAIGenerator: 1,
        planMeals: 1,
      },
    },
    {
      levelNumber: 2,
      levelName: "Home Cook",
      requirements: {
        cookRecipes: 10,
        saveFavorites: 5,
        sharePosts: 5,
        getLikes: 20,
        useAIGenerator: 3,
        planMeals: 3,
      },
    },
  ];

  test("returns 404 when user is not found", async () => {
    mockUserFindById.mockResolvedValue(null);

    const req = { params: { userId: "ghost-id" } };
    const res = makeMockRes();

    await getUserDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("returns 200 with dashboard data for a valid user", async () => {
    mockUserFindById.mockResolvedValue(mockUser);
    mockGamificationFind.mockResolvedValue(mockLevels);

    const req = { params: { userId: "mongo-user-id" } };
    const res = makeMockRes();

    await getUserDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userLevel: 2,
        stats: expect.any(Object),
        currentLevels: expect.any(Object),
      })
    );
  });

  test("subtracts previous level offsets from stats correctly", async () => {
    mockUserFindById.mockResolvedValue(mockUser);
    mockGamificationFind.mockResolvedValue(mockLevels);

    const req = { params: { userId: "mongo-user-id" } };
    const res = makeMockRes();

    await getUserDashboard(req, res);

    const stats = res.json.mock.calls[0][0].stats;
    // recipesCookedCount(8) - level1 offset(3) = 5
    expect(stats.recipesCooked).toBe(5);
    // favorites(3) - level1 offset(2) = 1
    expect(stats.favoritesSaved).toBe(1);
  });

  test("stats are capped at current level requirements", async () => {
    // User has cooked WAY more than required for level 2
    const overachievingUser = { ...mockUser, recipesCookedCount: 999, favorites: new Array(999) };
    mockUserFindById.mockResolvedValue(overachievingUser);
    mockGamificationFind.mockResolvedValue(mockLevels);

    const req = { params: { userId: "mongo-user-id" } };
    const res = makeMockRes();

    await getUserDashboard(req, res);

    const stats = res.json.mock.calls[0][0].stats;
    // Should be capped at level 2 requirement of 10
    expect(stats.recipesCooked).toBe(10);
    // Should be capped at level 2 requirement of 5
    expect(stats.favoritesSaved).toBe(5);
  });

  test("stats never go below 0", async () => {
    // User stats are lower than the offset (edge case)
    const lowUser = { ...mockUser, recipesCookedCount: 0, favorites: [] };
    mockUserFindById.mockResolvedValue(lowUser);
    mockGamificationFind.mockResolvedValue(mockLevels);

    const req = { params: { userId: "mongo-user-id" } };
    const res = makeMockRes();

    await getUserDashboard(req, res);

    const stats = res.json.mock.calls[0][0].stats;
    expect(stats.recipesCooked).toBeGreaterThanOrEqual(0);
    expect(stats.favoritesSaved).toBeGreaterThanOrEqual(0);
  });

  test("returns 500 on database error", async () => {
    mockUserFindById.mockRejectedValue(new Error("DB error"));

    const req = { params: { userId: "mongo-user-id" } };
    const res = makeMockRes();

    await getUserDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// =============================================================================
// getAllGamificationLevels
// =============================================================================
describe("getAllGamificationLevels", () => {
  test("returns all levels sorted by levelNumber", async () => {
    const levels = [
      { levelNumber: 1, levelName: "Rookie" },
      { levelNumber: 2, levelName: "Home Cook" },
      { levelNumber: 3, levelName: "Chef" },
    ];
    mockGamificationFind.mockResolvedValue(levels);

    const req = {};
    const res = makeMockRes();

    await getAllGamificationLevels(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(levels);
  });

  test("returns empty array when no levels exist", async () => {
    mockGamificationFind.mockResolvedValue([]);

    const req = {};
    const res = makeMockRes();

    await getAllGamificationLevels(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("returns 500 on database error", async () => {
    mockGamificationFind.mockRejectedValue(new Error("DB error"));

    const req = {};
    const res = makeMockRes();

    await getAllGamificationLevels(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});