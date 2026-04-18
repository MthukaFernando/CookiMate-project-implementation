import { jest } from "@jest/globals";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUserFindOne = jest.fn();
const mockUserFind = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindOneAndUpdate = jest.fn();
const mockUserFindByIdAndDelete = jest.fn();
const mockUserUpdateMany = jest.fn();

const mockUserInstance = {
  _id: "mongo-user-id",
  firebaseUid: "firebase-uid-001",
  username: "chef_mario",
  favorites: [],
  cookedHistory: [],
  recipesCookedCount: 0,
  blockedUsers: [],
  following: [],
  followers: [],
  save: jest.fn(),
  updateOne: jest.fn(),
  populate: jest.fn(),
};

jest.unstable_mockModule("../models/user.js", () => ({
  default: {
    findOne: mockUserFindOne,
    find: mockUserFind,
    create: mockUserCreate,
    findOneAndUpdate: mockUserFindOneAndUpdate,
    findByIdAndDelete: mockUserFindByIdAndDelete,
    updateMany: mockUserUpdateMany,
  },
}));

const mockRecipeFindOne = jest.fn();
jest.unstable_mockModule("../models/Recipe.js", () => ({
  default: { findOne: mockRecipeFindOne },
}));

const mockLevelFindOne = jest.fn();
const mockLevelFind = jest.fn();
jest.unstable_mockModule("../models/levels.js", () => ({
  default: {
    findOne: mockLevelFindOne,
    find: jest.fn().mockReturnValue({ sort: mockLevelFind }),
  },
}));

const mockUserProgressCreate = jest.fn();
jest.unstable_mockModule("../models/UserProgress.js", () => ({
  default: { create: mockUserProgressCreate },
}));

const mockPostFind = jest.fn();
const mockPostDeleteMany = jest.fn();
jest.unstable_mockModule("../models/Post.js", () => ({
  default: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: mockPostFind,
      }),
    }),
    deleteMany: mockPostDeleteMany,
  },
}));

const mockUpdateUserStats = jest.fn();
jest.unstable_mockModule("../utils/gamificationHelpers.js", () => ({
  updateUserStats: mockUpdateUserStats,
}));

// ─── Import controller after mocks ───────────────────────────────────────────

const {
  createUser,
  getUserByUid,
  updateUser,
  addToFavorites,
  removeFromFavorites,
  toggleFollow,
  searchUsers,
  incrementCookCount,
  addToMealPlan,
  removeFromMealPlan,
  deleteUser,
  toggleBlockUser,
  getFans,
  removeFollower,
} = await import("../controllers/userController.js");

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
  jest.spyOn(console, "log").mockImplementation(() => {});
  mockUpdateUserStats.mockResolvedValue(true);
});

afterEach(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

// =============================================================================
// createUser
// =============================================================================
describe("createUser", () => {
  test("returns 400 when user already exists", async () => {
    mockUserFindOne.mockResolvedValue({ firebaseUid: "firebase-uid-001" });
    const req = { body: { firebaseUid: "firebase-uid-001", username: "chef", name: "Mario" } };
    const res = makeMockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
  });

  test("creates user and returns 201 on success", async () => {
    const newUser = { _id: "mongo-user-id", username: "chef_mario" };
    mockUserFindOne.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue(newUser);
    mockLevelFindOne.mockResolvedValue({ _id: "level-1-id" });
    mockUserProgressCreate.mockResolvedValue(true);

    const req = { body: { firebaseUid: "firebase-uid-001", username: "chef_mario", name: "Mario" } };
    const res = makeMockRes();

    await createUser(req, res);

    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({ firebaseUid: "firebase-uid-001" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newUser);
  });

  test("returns 500 on database error", async () => {
    mockUserFindOne.mockRejectedValue(new Error("DB error"));
    const req = { body: { firebaseUid: "uid", username: "chef", name: "Mario" } };
    const res = makeMockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// =============================================================================
// getUserByUid
// =============================================================================
describe("getUserByUid", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }),
    });
    const req = { params: { uid: "ghost-uid" } };
    const res = makeMockRes();

    await getUserByUid(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("returns 200 with user data when found", async () => {
    const user = { ...mockUserInstance };
    mockUserFindOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(user) }),
    });
    const req = { params: { uid: "firebase-uid-001" } };
    const res = makeMockRes();

    await getUserByUid(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });
});

// =============================================================================
// updateUser
// =============================================================================
describe("updateUser", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOneAndUpdate.mockResolvedValue(null);
    const req = { params: { uid: "ghost-uid" }, body: { username: "new_chef" } };
    const res = makeMockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("returns 200 with updated user on success", async () => {
    const updated = { ...mockUserInstance, username: "new_chef" };
    mockUserFindOneAndUpdate.mockResolvedValue(updated);
    const req = { params: { uid: "firebase-uid-001" }, body: { username: "new_chef" } };
    const res = makeMockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("returns 400 when username is already taken (duplicate key error)", async () => {
    const dupError = Object.assign(new Error("Duplicate"), { code: 11000 });
    mockUserFindOneAndUpdate.mockRejectedValue(dupError);
    const req = { params: { uid: "firebase-uid-001" }, body: { username: "taken_name" } };
    const res = makeMockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Username already taken" });
  });
});

// =============================================================================
// addToFavorites / removeFromFavorites
// =============================================================================
describe("addToFavorites", () => {
  const mockRecipe = { _id: "recipe-mongo-id" };

  test("returns 404 when recipe is not found", async () => {
    mockRecipeFindOne.mockResolvedValue(null);
    const req = { params: { uid: "firebase-uid-001" }, body: { recipeId: "ghost-recipe" } };
    const res = makeMockRes();

    await addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe not found" });
  });

  test("returns 400 when recipe is already in favorites", async () => {
    mockRecipeFindOne.mockResolvedValue(mockRecipe);
    mockUserFindOne.mockResolvedValue({
      ...mockUserInstance,
      favorites: [mockRecipe._id],
      includes: undefined,
    });
    // Simulate favorites.includes returning true
    const userWithFav = {
      ...mockUserInstance,
      favorites: { includes: jest.fn().mockReturnValue(true) },
    };
    mockUserFindOne.mockResolvedValue(userWithFav);
    const req = { params: { uid: "firebase-uid-001" }, body: { recipeId: "rec-001" } };
    const res = makeMockRes();

    await addToFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe already in favorites" });
  });

  test("adds recipe and returns 200 on success", async () => {
    mockRecipeFindOne.mockResolvedValue(mockRecipe);
    const userWithSave = {
      ...mockUserInstance,
      favorites: { includes: jest.fn().mockReturnValue(false), push: jest.fn() },
      save: jest.fn().mockResolvedValue(true),
    };
    mockUserFindOne.mockResolvedValue(userWithSave);
    const req = { params: { uid: "firebase-uid-001" }, body: { recipeId: "rec-001" } };
    const res = makeMockRes();

    await addToFavorites(req, res);

    expect(userWithSave.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe added to favorites" });
  });
});

describe("removeFromFavorites", () => {
  test("returns 404 when recipe is not found", async () => {
    mockRecipeFindOne.mockResolvedValue(null);
    const req = { params: { uid: "firebase-uid-001" }, body: { recipeId: "ghost" } };
    const res = makeMockRes();

    await removeFromFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe not found" });
  });

  test("returns 200 after removing recipe from favorites", async () => {
    mockRecipeFindOne.mockResolvedValue({ _id: "recipe-mongo-id" });
    mockUserFindOneAndUpdate.mockResolvedValue(mockUserInstance);
    const req = { params: { uid: "firebase-uid-001" }, body: { recipeId: "rec-001" } };
    const res = makeMockRes();

    await removeFromFavorites(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe removed from favorites" });
  });
});

// =============================================================================
// toggleFollow
// =============================================================================
describe("toggleFollow", () => {
  test("returns 400 when user tries to follow themselves", async () => {
    mockUserFindOne.mockResolvedValue(mockUserInstance);
    const req = { body: { targetUserId: "same-uid", currentUserId: "same-uid" } };
    const res = makeMockRes();

    await toggleFollow(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Cannot follow yourself" });
  });

  test("returns 404 when either user is not found", async () => {
    mockUserFindOne.mockResolvedValueOnce(null);
    const req = { body: { targetUserId: "uid-a", currentUserId: "uid-b" } };
    const res = makeMockRes();

    await toggleFollow(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("follows user and returns isFollowing: true when not already following", async () => {
    const targetUser = { _id: "target-id", updateOne: jest.fn() };
    const currentUser = {
      _id: "current-id",
      following: { some: jest.fn().mockReturnValue(false) },
      updateOne: jest.fn(),
    };
    mockUserFindOne
      .mockResolvedValueOnce(targetUser)
      .mockResolvedValueOnce(currentUser);

    const req = { body: { targetUserId: "uid-target", currentUserId: "uid-current" } };
    const res = makeMockRes();

    await toggleFollow(req, res);

    expect(currentUser.updateOne).toHaveBeenCalledWith({ $push: { following: targetUser._id } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ isFollowing: true });
  });

  test("unfollows user and returns isFollowing: false when already following", async () => {
    const targetUser = { _id: "target-id", updateOne: jest.fn() };
    const currentUser = {
      _id: "current-id",
      following: { some: jest.fn().mockReturnValue(true) },
      updateOne: jest.fn(),
    };
    mockUserFindOne
      .mockResolvedValueOnce(targetUser)
      .mockResolvedValueOnce(currentUser);

    const req = { body: { targetUserId: "uid-target", currentUserId: "uid-current" } };
    const res = makeMockRes();

    await toggleFollow(req, res);

    expect(currentUser.updateOne).toHaveBeenCalledWith({ $pull: { following: targetUser._id } });
    expect(res.json).toHaveBeenCalledWith({ isFollowing: false });
  });
});

// =============================================================================
// searchUsers
// =============================================================================
describe("searchUsers", () => {
  test("returns 400 when no username query is provided", async () => {
    const req = { query: {} };
    const res = makeMockRes();

    await searchUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Username required" });
  });

  test("returns matching users for a valid query", async () => {
    const users = [{ username: "chef_mario", profilePic: "pic.jpg" }];
    mockUserFind.mockReturnValue({ select: jest.fn().mockResolvedValue(users) });
    const req = { query: { username: "chef" } };
    const res = makeMockRes();

    await searchUsers(req, res);

    expect(mockUserFind).toHaveBeenCalledWith({
      username: { $regex: "chef", $options: "i" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });
});

// =============================================================================
// incrementCookCount
// =============================================================================
describe("incrementCookCount", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = { params: { uid: "ghost-uid" }, body: { recipeId: "rec-001" } };
    const res = makeMockRes();

    await incrementCookCount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("adds new entry and triggers gamification for a new recipe", async () => {
    const populatedHistory = [{ recipeId: { _id: "rec-001", name: "Pasta" }, timesCooked: 1 }];
    const userMock = {
      ...mockUserInstance,
      cookedHistory: [],
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue({
        recipesCookedCount: 1,
        cookedHistory: populatedHistory,
      }),
    };
    mockUserFindOne.mockResolvedValue(userMock);

    const req = { params: { uid: "firebase-uid-001" }, body: { recipeId: "rec-001" } };
    const res = makeMockRes();

    await incrementCookCount(req, res);

    expect(userMock.cookedHistory).toHaveLength(1);
    expect(mockUpdateUserStats).toHaveBeenCalledWith(userMock._id, "COOK_RECIPE");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("increments timesCooked but does NOT trigger gamification for a repeat recipe", async () => {
    const existingEntry = { recipeId: { toString: () => "rec-001" }, timesCooked: 2, dateCooked: new Date() };
    const populatedHistory = [{ recipeId: { _id: "rec-001" }, timesCooked: 3 }];
    const userMock = {
      ...mockUserInstance,
      cookedHistory: [existingEntry],
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue({
        recipesCookedCount: 1,
        cookedHistory: populatedHistory,
      }),
    };
    mockUserFindOne.mockResolvedValue(userMock);

    const req = { params: { uid: "firebase-uid-001" }, body: { recipeId: "rec-001" } };
    const res = makeMockRes();

    await incrementCookCount(req, res);

    expect(mockUpdateUserStats).not.toHaveBeenCalled();
    expect(existingEntry.timesCooked).toBe(3);
  });
});

// =============================================================================
// addToMealPlan / removeFromMealPlan
// =============================================================================
describe("addToMealPlan", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOneAndUpdate.mockResolvedValue(null);
    const req = { params: { uid: "ghost-uid" }, body: { uniqueId: "m1", id: "rec-1", name: "Pasta", date: "2025-01-01" } };
    const res = makeMockRes();

    await addToMealPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("adds meal and returns updated meal plan with 200", async () => {
    const mealPlan = [{ uniqueId: "m1", recipeId: "rec-1", name: "Pasta", date: "2025-01-01" }];
    mockUserFindOneAndUpdate.mockResolvedValue({ ...mockUserInstance, _id: "mongo-user-id", mealPlan });

    const req = { params: { uid: "firebase-uid-001" }, body: { uniqueId: "m1", id: "rec-1", name: "Pasta", date: "2025-01-01" } };
    const res = makeMockRes();

    await addToMealPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mealPlan);
  });
});

describe("removeFromMealPlan", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOneAndUpdate.mockResolvedValue(null);
    const req = { params: { uid: "ghost-uid" }, body: { uniqueId: "m1" } };
    const res = makeMockRes();

    await removeFromMealPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 200 with success message after removing meal", async () => {
    mockUserFindOneAndUpdate.mockResolvedValue({ ...mockUserInstance, mealPlan: [] });
    const req = { params: { uid: "firebase-uid-001" }, body: { uniqueId: "m1" } };
    const res = makeMockRes();

    await removeFromMealPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Meal removed from planner" });
  });
});

// =============================================================================
// deleteUser
// =============================================================================
describe("deleteUser", () => {
  test("returns 404 when user is not found", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = { params: { uid: "ghost-uid" } };
    const res = makeMockRes();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deletes user, cleans up followers/following, and deletes posts", async () => {
    const user = { _id: "mongo-user-id", firebaseUid: "firebase-uid-001" };
    mockUserFindOne.mockResolvedValue(user);
    mockUserUpdateMany.mockResolvedValue(true);
    mockPostDeleteMany.mockResolvedValue(true);
    mockUserFindByIdAndDelete.mockResolvedValue(true);

    const req = { params: { uid: "firebase-uid-001" } };
    const res = makeMockRes();

    await deleteUser(req, res);

    expect(mockUserUpdateMany).toHaveBeenCalled();
    expect(mockPostDeleteMany).toHaveBeenCalledWith({ user: "firebase-uid-001" });
    expect(mockUserFindByIdAndDelete).toHaveBeenCalledWith(user._id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "User account deleted successfully" });
  });
});

// =============================================================================
// toggleBlockUser
// =============================================================================
describe("toggleBlockUser", () => {
  test("returns 400 when trying to block yourself", async () => {
    const req = { body: { currentUserUid: "same-uid", targetUserUid: "same-uid" } };
    const res = makeMockRes();

    await toggleBlockUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Cannot block yourself" });
  });

  test("blocks user and returns blocked: true when not already blocked", async () => {
    const currentUser = {
      ...mockUserInstance,
      blockedUsers: { includes: jest.fn().mockReturnValue(false) },
      updateOne: jest.fn(),
    };
    mockUserFindOne.mockResolvedValue(currentUser);

    const req = { body: { currentUserUid: "uid-a", targetUserUid: "uid-b" } };
    const res = makeMockRes();

    await toggleBlockUser(req, res);

    expect(currentUser.updateOne).toHaveBeenCalledWith({ $addToSet: { blockedUsers: "uid-b" } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ blocked: true });
  });

  test("unblocks user and returns blocked: false when already blocked", async () => {
    const currentUser = {
      ...mockUserInstance,
      blockedUsers: { includes: jest.fn().mockReturnValue(true) },
      updateOne: jest.fn(),
    };
    mockUserFindOne.mockResolvedValue(currentUser);

    const req = { body: { currentUserUid: "uid-a", targetUserUid: "uid-b" } };
    const res = makeMockRes();

    await toggleBlockUser(req, res);

    expect(currentUser.updateOne).toHaveBeenCalledWith({ $pull: { blockedUsers: "uid-b" } });
    expect(res.json).toHaveBeenCalledWith({ blocked: false });
  });
});

// =============================================================================
// removeFollower
// =============================================================================
describe("removeFollower", () => {
  test("returns 404 when either user is not found", async () => {
    mockUserFindOne.mockResolvedValueOnce(null);
    const req = { body: { currentUserUid: "uid-a", followerUid: "uid-b" } };
    const res = makeMockRes();

    await removeFollower(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("removes follower from both users and returns 200", async () => {
    const currentUser = { _id: "current-id", updateOne: jest.fn() };
    const follower = { _id: "follower-id", updateOne: jest.fn() };
    mockUserFindOne
      .mockResolvedValueOnce(currentUser)
      .mockResolvedValueOnce(follower);

    const req = { body: { currentUserUid: "uid-a", followerUid: "uid-b" } };
    const res = makeMockRes();

    await removeFollower(req, res);

    expect(currentUser.updateOne).toHaveBeenCalledWith({ $pull: { followers: follower._id } });
    expect(follower.updateOne).toHaveBeenCalledWith({ $pull: { following: currentUser._id } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Follower removed" });
  });
});