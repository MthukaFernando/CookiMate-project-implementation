import { jest } from "@jest/globals";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockFindById = jest.fn();
const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockAggregate = jest.fn();
const mockDeleteOne = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: jest.fn((id) => /^[a-f\d]{24}$/i.test(id)),
      },
    },
  },
}));

jest.unstable_mockModule("../models/Recipe.js", () => ({
  default: {
    find: mockFind,
    findById: mockFindById,
    findOne: mockFindOne,
    aggregate: mockAggregate,
    deleteOne: mockDeleteOne,
  },
}));

const mockSeasonalFindById = jest.fn();
const mockSeasonalFindOne = jest.fn();
const mockSeasonalFind = jest.fn();

jest.unstable_mockModule("../models/SeasonalRecipe.js", () => ({
  default: {
    find: mockSeasonalFind,
    findById: mockSeasonalFindById,
    findOne: mockSeasonalFindOne,
  },
}));

const mockUserFindOne = jest.fn();

jest.unstable_mockModule("../models/user.js", () => ({
  default: { findOne: mockUserFindOne },
}));

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

// ─── Import controller after mocks ───────────────────────────────────────────

const {
  getAllRecipes,
  getRecipeById,
  getSeasonalRecipes,
  getRandomRecipes,
  deleteGeneratedRecipe,
} = await import("../controllers/recipeController.js");

// =============================================================================
// getAllRecipes
// =============================================================================
describe("getAllRecipes", () => {
  const SAMPLE_RECIPES = [
    { name: "Pasta", meal_type: ["dinner"], cuisine: ["Italian"], search_terms: ["vegan"], totalTime: "30m" },
    { name: "Salad", meal_type: ["lunch"], cuisine: ["American"], search_terms: ["vegetarian"], totalTime: "10m" },
  ];

  test("returns all recipes when no filters are provided", async () => {
    mockFind.mockResolvedValue(SAMPLE_RECIPES);

    const res = makeMockRes();
    await getAllRecipes({ query: {} }, res);

    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(SAMPLE_RECIPES);
  });

  test("filters by searchQuery, meal type, cuisine, and diet correctly", async () => {
    mockFind.mockResolvedValue([SAMPLE_RECIPES[0]]);

    await getAllRecipes({ query: { searchQuery: "pasta" } }, makeMockRes());
    expect(mockFind).toHaveBeenCalledWith({ name: { $regex: "pasta", $options: "i" } });

    await getAllRecipes({ query: { meal: "Dinner" } }, makeMockRes());
    expect(mockFind).toHaveBeenCalledWith({ meal_type: "dinner" });

    await getAllRecipes({ query: { cuisine: "Italian" } }, makeMockRes());
    expect(mockFind).toHaveBeenCalledWith({ cuisine: "Italian" });

    await getAllRecipes({ query: { diet: "Vegan" } }, makeMockRes());
    expect(mockFind).toHaveBeenCalledWith({ search_terms: "vegan" });
  });

  test("time filter returns only recipes within the correct bucket", async () => {
    const recipes = [{ totalTime: "10m" }, { totalTime: "25m" }, { totalTime: "45m" }];
    mockFind.mockResolvedValue(recipes);

    const res = makeMockRes();
    await getAllRecipes({ query: { time: "15" } }, res);

    const result = res.json.mock.calls[0][0];
    expect(result).toHaveLength(1);
    expect(result[0].totalTime).toBe("10m");
  });

  test("returns 500 on database error", async () => {
    mockFind.mockRejectedValue(new Error("DB down"));

    const res = makeMockRes();
    await getAllRecipes({ query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});

// =============================================================================
// getRecipeById
// =============================================================================
describe("getRecipeById", () => {
  const VALID_OID = "64abc1234567890123456789";
  const CUSTOM_ID = "custom-id-123";

  test("finds recipe by MongoDB ObjectId, falls back to SeasonalRecipe if not found", async () => {
    const seasonal = { _id: VALID_OID, name: "Pumpkin Soup" };
    mockFindById.mockResolvedValue(null);
    mockSeasonalFindById.mockResolvedValue(seasonal);

    const res = makeMockRes();
    await getRecipeById({ params: { id: VALID_OID } }, res);

    expect(mockSeasonalFindById).toHaveBeenCalledWith(VALID_OID);
    expect(res.json).toHaveBeenCalledWith(seasonal);
  });

  test("finds recipe by custom id, falls back to SeasonalRecipe if not found", async () => {
    const seasonal = { id: CUSTOM_ID, name: "Mulled Wine" };
    mockFindOne.mockResolvedValue(null);
    mockSeasonalFindOne.mockResolvedValue(seasonal);

    const res = makeMockRes();
    await getRecipeById({ params: { id: CUSTOM_ID } }, res);

    expect(mockSeasonalFindOne).toHaveBeenCalledWith({ id: CUSTOM_ID });
    expect(res.json).toHaveBeenCalledWith(seasonal);
  });

  test("returns 404 when recipe is not found anywhere", async () => {
    mockFindOne.mockResolvedValue(null);
    mockSeasonalFindOne.mockResolvedValue(null);

    const res = makeMockRes();
    await getRecipeById({ params: { id: "ghost-id" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe not found" });
  });

  test("returns 500 on unexpected error", async () => {
    mockFindOne.mockRejectedValue(new Error("Connection lost"));

    const res = makeMockRes();
    await getRecipeById({ params: { id: CUSTOM_ID } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// =============================================================================
// getSeasonalRecipes
// =============================================================================
describe("getSeasonalRecipes", () => {
  test("returns seasonal recipes from the database", async () => {
    const seasonal = [{ name: "Pumpkin Pie" }, { name: "Eggnog" }];
    mockSeasonalFind.mockResolvedValue(seasonal);

    const res = makeMockRes();
    await getSeasonalRecipes({}, res);

    expect(res.json).toHaveBeenCalledWith(seasonal);
  });

  test("returns 500 on database error", async () => {
    mockSeasonalFind.mockRejectedValue(new Error("Timeout"));

    const res = makeMockRes();
    await getSeasonalRecipes({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// =============================================================================
// getRandomRecipes
// =============================================================================
describe("getRandomRecipes", () => {
  test("returns 5 random recipes via $sample aggregation", async () => {
    const randomRecipes = Array.from({ length: 5 }, (_, i) => ({ name: `Recipe ${i}` }));
    mockAggregate.mockResolvedValue(randomRecipes);

    const res = makeMockRes();
    await getRandomRecipes({}, res);

    expect(mockAggregate).toHaveBeenCalledWith([{ $sample: { size: 5 } }]);
    expect(res.json).toHaveBeenCalledWith(randomRecipes);
  });

  test("returns 500 on aggregation error", async () => {
    mockAggregate.mockRejectedValue(new Error("Aggregation failed"));

    const res = makeMockRes();
    await getRandomRecipes({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// =============================================================================
// deleteGeneratedRecipe
// =============================================================================
describe("deleteGeneratedRecipe", () => {
  const RECIPE_ID = "recipe-abc";
  const USER_ID = "firebase-uid-xyz";
  const baseRecipe = { id: RECIPE_ID, isGenerated: true, generatedBy: USER_ID };
  const baseUser = { favorites: [{ id: RECIPE_ID }, { id: "keep-this" }], save: mockSave };

  test("successfully deletes recipe and removes it from user favorites", async () => {
    mockFindOne.mockResolvedValue({ ...baseRecipe });
    mockUserFindOne.mockResolvedValue({ ...baseUser, save: mockSave });
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 });
    mockSave.mockResolvedValue(true);

    const res = makeMockRes();
    await deleteGeneratedRecipe({ params: { id: RECIPE_ID }, body: { userId: USER_ID } }, res);

    expect(mockDeleteOne).toHaveBeenCalledWith({ id: RECIPE_ID });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("returns 400 when userId is missing", async () => {
    const res = makeMockRes();
    await deleteGeneratedRecipe({ params: { id: RECIPE_ID }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
  });

  test("returns 404 when recipe is not found", async () => {
    mockFindOne.mockResolvedValue(null);

    const res = makeMockRes();
    await deleteGeneratedRecipe({ params: { id: "ghost-id" }, body: { userId: USER_ID } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 403 when recipe is not generated or user is not the owner", async () => {
    mockFindOne.mockResolvedValue({ ...baseRecipe, isGenerated: false });
    const res1 = makeMockRes();
    await deleteGeneratedRecipe({ params: { id: RECIPE_ID }, body: { userId: USER_ID } }, res1);
    expect(res1.status).toHaveBeenCalledWith(403);

    mockFindOne.mockResolvedValue({ ...baseRecipe, generatedBy: "other-user" });
    const res2 = makeMockRes();
    await deleteGeneratedRecipe({ params: { id: RECIPE_ID }, body: { userId: USER_ID } }, res2);
    expect(res2.status).toHaveBeenCalledWith(403);
  });

  test("returns 500 on unexpected database error", async () => {
    mockFindOne.mockRejectedValue(new Error("DB error"));

    const res = makeMockRes();
    await deleteGeneratedRecipe({ params: { id: RECIPE_ID }, body: { userId: USER_ID } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});