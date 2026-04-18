import { jest } from "@jest/globals";

// Mock mongoose 
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

// Mock Recipe model 
jest.unstable_mockModule("../models/Recipe.js", () => ({
  default: {
    find: mockFind,
    findById: mockFindById,
    findOne: mockFindOne,
    aggregate: mockAggregate,
    deleteOne: mockDeleteOne,
  },
}));

// Mock SeasonalRecipe model 
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

// Mock User model 
const mockUserFindOne = jest.fn();

jest.unstable_mockModule("../models/user.js", () => ({
  default: {
    findOne: mockUserFindOne,
  },
}));

// Helpers 
const makeMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Suppress console.error output during tests (expected errors from catch blocks)
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

// Import controller AFTER mocks are registered 
const {
  getAllRecipes,
  getRecipeById,
  getSeasonalRecipes,
  getRandomRecipes,
  deleteGeneratedRecipe,
} = await import("../controllers/recipeController.js");

// getAllRecipes
describe("getAllRecipes", () => {
  beforeEach(() => jest.clearAllMocks());

  const SAMPLE_RECIPES = [
    {
      name: "Pasta",
      meal_type: ["dinner"],
      cuisine: ["Italian"],
      search_terms: ["vegan"],
      totalTime: "30m",
    },
    {
      name: "Salad",
      meal_type: ["lunch"],
      cuisine: ["American"],
      search_terms: ["vegetarian"],
      totalTime: "10m",
    },
  ];

  test("returns all recipes when no filters are provided", async () => {
    mockFind.mockResolvedValue(SAMPLE_RECIPES);
    const req = { query: {} };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(SAMPLE_RECIPES);
  });

  test("filters by searchQuery (name regex)", async () => {
    mockFind.mockResolvedValue([SAMPLE_RECIPES[0]]);
    const req = { query: { searchQuery: "pasta" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(mockFind).toHaveBeenCalledWith({
      name: { $regex: "pasta", $options: "i" },
    });
  });

  test("filters by meal type", async () => {
    mockFind.mockResolvedValue([SAMPLE_RECIPES[0]]);
    const req = { query: { meal: "Dinner" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(mockFind).toHaveBeenCalledWith({ meal_type: "dinner" });
  });

  test("ignores meal filter when value is 'All'", async () => {
    mockFind.mockResolvedValue(SAMPLE_RECIPES);
    const req = { query: { meal: "All" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(mockFind).toHaveBeenCalledWith({});
  });

  test("filters by cuisine", async () => {
    mockFind.mockResolvedValue([SAMPLE_RECIPES[0]]);
    const req = { query: { cuisine: "Italian" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(mockFind).toHaveBeenCalledWith({ cuisine: "Italian" });
  });

  test("filters by diet (search_terms)", async () => {
    mockFind.mockResolvedValue([SAMPLE_RECIPES[0]]);
    const req = { query: { diet: "Vegan" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(mockFind).toHaveBeenCalledWith({ search_terms: "vegan" });
  });

  test("time filter ≤ 15 min keeps only quick recipes", async () => {
    const recipes = [
      { totalTime: "10m" },
      { totalTime: "20m" },
      { totalTime: "5m" },
    ];
    mockFind.mockResolvedValue(recipes);
    const req = { query: { time: "15" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    const result = res.json.mock.calls[0][0];
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.totalTime.match(/\d+/)[0] <= 15)).toBe(true);
  });

  test("time filter 16–30 min bucket", async () => {
    const recipes = [
      { totalTime: "10m" },
      { totalTime: "25m" },
      { totalTime: "45m" },
    ];
    mockFind.mockResolvedValue(recipes);
    const req = { query: { time: "30" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    const result = res.json.mock.calls[0][0];
    expect(result).toHaveLength(1);
    expect(result[0].totalTime).toBe("25m");
  });

  test("time filter 31–60 min bucket", async () => {
    const recipes = [
      { totalTime: "10m" },
      { totalTime: "25m" },
      { totalTime: "45m" },
      { totalTime: "1h 10m" },
    ];
    mockFind.mockResolvedValue(recipes);
    const req = { query: { time: "60" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    const result = res.json.mock.calls[0][0];
    expect(result).toHaveLength(1);
    expect(result[0].totalTime).toBe("45m");
  });

  test("parses hour + minute combined time strings", async () => {
    const recipes = [{ totalTime: "1h 30m" }, { totalTime: "2h" }];
    mockFind.mockResolvedValue(recipes);
    const req = { query: { time: "60" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    // 1h30m = 90 min (> 60), 2h = 120 min (> 60) — neither fits the 31-60 bucket
    expect(res.json.mock.calls[0][0]).toHaveLength(0);
  });

  test("excludes recipes with no totalTime when time filter is active", async () => {
    const recipes = [{ name: "Mystery dish" /* no totalTime */ }];
    mockFind.mockResolvedValue(recipes);
    const req = { query: { time: "15" } };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(res.json.mock.calls[0][0]).toHaveLength(0);
  });

  test("returns 500 on database error", async () => {
    mockFind.mockRejectedValue(new Error("DB down"));
    const req = { query: {} };
    const res = makeMockRes();

    await getAllRecipes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});

// getRecipeById
describe("getRecipeById", () => {
  const VALID_OBJECT_ID = "64abc1234567890123456789";
  const CUSTOM_ID = "custom-id-123";

  beforeEach(() => jest.clearAllMocks());

  test("finds recipe by valid MongoDB ObjectId in Recipe collection", async () => {
    const recipe = { _id: VALID_OBJECT_ID, name: "Soup" };
    mockFindById.mockResolvedValue(recipe);
    const req = { params: { id: VALID_OBJECT_ID } };
    const res = makeMockRes();

    await getRecipeById(req, res);

    expect(mockFindById).toHaveBeenCalledWith(VALID_OBJECT_ID);
    expect(res.json).toHaveBeenCalledWith(recipe);
  });

  test("falls back to SeasonalRecipe when not found by ObjectId in Recipe", async () => {
    const seasonal = { _id: VALID_OBJECT_ID, name: "Pumpkin Soup" };
    mockFindById.mockResolvedValue(null);
    mockSeasonalFindById.mockResolvedValue(seasonal);
    const req = { params: { id: VALID_OBJECT_ID } };
    const res = makeMockRes();

    await getRecipeById(req, res);

    expect(mockSeasonalFindById).toHaveBeenCalledWith(VALID_OBJECT_ID);
    expect(res.json).toHaveBeenCalledWith(seasonal);
  });

  test("finds recipe by custom id field when ObjectId lookup fails", async () => {
    const recipe = { id: CUSTOM_ID, name: "Tacos" };
    mockFindOne.mockResolvedValue(recipe);
    const req = { params: { id: CUSTOM_ID } };
    const res = makeMockRes();

    await getRecipeById(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ id: CUSTOM_ID });
    expect(res.json).toHaveBeenCalledWith(recipe);
  });

  test("falls back to SeasonalRecipe custom id when Recipe.findOne returns null", async () => {
    const seasonal = { id: CUSTOM_ID, name: "Mulled Wine" };
    mockFindOne.mockResolvedValue(null);
    mockSeasonalFindOne.mockResolvedValue(seasonal);
    const req = { params: { id: CUSTOM_ID } };
    const res = makeMockRes();

    await getRecipeById(req, res);

    expect(mockSeasonalFindOne).toHaveBeenCalledWith({ id: CUSTOM_ID });
    expect(res.json).toHaveBeenCalledWith(seasonal);
  });

  test("returns 404 when recipe is not found anywhere", async () => {
    mockFindOne.mockResolvedValue(null);
    mockSeasonalFindOne.mockResolvedValue(null);
    const req = { params: { id: "ghost-id" } };
    const res = makeMockRes();

    await getRecipeById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe not found" });
  });

  test("returns 500 on unexpected error", async () => {
    mockFindOne.mockRejectedValue(new Error("Connection lost"));
    const req = { params: { id: CUSTOM_ID } };
    const res = makeMockRes();

    await getRecipeById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// getSeasonalRecipes
describe("getSeasonalRecipes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns seasonal recipes from the database", async () => {
    const seasonal = [{ name: "Pumpkin Pie" }, { name: "Eggnog" }];
    mockSeasonalFind.mockResolvedValue(seasonal);
    const req = {};
    const res = makeMockRes();

    await getSeasonalRecipes(req, res);

    expect(mockSeasonalFind).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(seasonal);
  });

  test("returns empty array when no seasonal recipes match", async () => {
    mockSeasonalFind.mockResolvedValue([]);
    const req = {};
    const res = makeMockRes();

    await getSeasonalRecipes(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("returns 500 on database error", async () => {
    mockSeasonalFind.mockRejectedValue(new Error("Timeout"));
    const req = {};
    const res = makeMockRes();

    await getSeasonalRecipes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].message).toContain("Timeout");
  });
});

// getRandomRecipes
describe("getRandomRecipes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 5 random recipes via aggregation", async () => {
    const randomRecipes = Array.from({ length: 5 }, (_, i) => ({ name: `Recipe ${i}` }));
    mockAggregate.mockResolvedValue(randomRecipes);
    const req = {};
    const res = makeMockRes();

    await getRandomRecipes(req, res);

    expect(mockAggregate).toHaveBeenCalledWith([{ $sample: { size: 5 } }]);
    expect(res.json).toHaveBeenCalledWith(randomRecipes);
  });

  test("returns 500 on aggregation error", async () => {
    mockAggregate.mockRejectedValue(new Error("Aggregation failed"));
    const req = {};
    const res = makeMockRes();

    await getRandomRecipes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Aggregation failed" });
  });
});

// deleteGeneratedRecipe
describe("deleteGeneratedRecipe", () => {
  const RECIPE_ID = "recipe-abc";
  const USER_ID = "firebase-uid-xyz";

  const baseRecipe = {
    id: RECIPE_ID,
    isGenerated: true,
    generatedBy: USER_ID,
  };

  const baseUser = {
    favorites: [{ id: RECIPE_ID }, { id: "other-recipe" }],
    save: mockSave,
  };

  beforeEach(() => jest.clearAllMocks());

  test("successfully deletes a generated recipe and removes it from user favorites", async () => {
    mockFindOne.mockResolvedValue({ ...baseRecipe });
    mockUserFindOne.mockResolvedValue({ ...baseUser, save: mockSave });
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 });
    mockSave.mockResolvedValue(true);

    const req = { params: { id: RECIPE_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(mockDeleteOne).toHaveBeenCalledWith({ id: RECIPE_ID });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test("returns 400 when userId is missing", async () => {
    const req = { params: { id: RECIPE_ID }, body: {} };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
  });

  test("returns 404 when recipe is not found", async () => {
    mockFindOne.mockResolvedValue(null);
    const req = { params: { id: "unknown-id" }, body: { userId: USER_ID } };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe not found" });
  });

  test("returns 403 when recipe is not a generated recipe", async () => {
    mockFindOne.mockResolvedValue({ ...baseRecipe, isGenerated: false });
    const req = { params: { id: RECIPE_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only generated recipes can be deleted",
    });
  });

  test("returns 403 when user did not generate the recipe", async () => {
    mockFindOne.mockResolvedValue({ ...baseRecipe, generatedBy: "other-user" });
    const req = { params: { id: RECIPE_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You can only delete recipes you generated",
    });
  });

  test("deletes recipe even when user record is not found in DB", async () => {
    mockFindOne.mockResolvedValue({ ...baseRecipe });
    mockUserFindOne.mockResolvedValue(null); // user not in DB
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

    const req = { params: { id: RECIPE_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(mockDeleteOne).toHaveBeenCalledWith({ id: RECIPE_ID });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("removes the deleted recipe from user favorites array", async () => {
    const user = {
      favorites: [{ id: RECIPE_ID }, { id: "keep-this" }],
      save: mockSave,
    };
    mockFindOne.mockResolvedValue({ ...baseRecipe });
    mockUserFindOne.mockResolvedValue(user);
    mockDeleteOne.mockResolvedValue({});
    mockSave.mockResolvedValue(true);

    const req = { params: { id: RECIPE_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(user.favorites).toHaveLength(1);
    expect(user.favorites[0].id).toBe("keep-this");
    expect(mockSave).toHaveBeenCalled();
  });

  test("returns 500 on unexpected database error", async () => {
    mockFindOne.mockRejectedValue(new Error("Unexpected DB error"));
    const req = { params: { id: RECIPE_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();

    await deleteGeneratedRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});