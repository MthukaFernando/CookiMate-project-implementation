import { jest } from "@jest/globals";

// Mock: Post model 
const mockPostFind = jest.fn();
const mockPostFindById = jest.fn();
const mockPostFindByIdAndDelete = jest.fn();
const mockPostFindByIdAndUpdate = jest.fn();
const mockPostFindOneAndUpdate = jest.fn();
const mockPostSave = jest.fn();
const mockPostUpdateOne = jest.fn();

const MockPost = jest.fn().mockImplementation((data) => ({
  ...data,
  _id: "post-mongo-id-001",
  save: mockPostSave,
}));
MockPost.find = mockPostFind;
MockPost.findById = mockPostFindById;
MockPost.findByIdAndDelete = mockPostFindByIdAndDelete;
MockPost.findByIdAndUpdate = mockPostFindByIdAndUpdate;
MockPost.findOneAndUpdate = mockPostFindOneAndUpdate;

jest.unstable_mockModule("../models/Post.js", () => ({ default: MockPost }));

// Mock: User model 
const mockUserFindOne = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockUserFindOneAndUpdate = jest.fn();

jest.unstable_mockModule("../models/user.js", () => ({
  default: {
    findOne: mockUserFindOne,
    findByIdAndUpdate: mockUserFindByIdAndUpdate,
    findOneAndUpdate: mockUserFindOneAndUpdate,
  },
}));

// Mock: Cloudinary 
const mockCloudinaryDestroy = jest.fn();
jest.unstable_mockModule("../config/cloudinary.js", () => ({
  cloudinary: { uploader: { destroy: mockCloudinaryDestroy } },
  upload: { single: jest.fn() },
}));

// Mock: dotenv
jest.unstable_mockModule("dotenv", () => ({ default: { config: jest.fn() } }));

// Mock: axios 
const mockAxiosPost = jest.fn();
jest.unstable_mockModule("axios", () => ({ default: { post: mockAxiosPost } }));

// Mock: gamificationHelpers 
const mockUpdateUserStats = jest.fn();
jest.unstable_mockModule("../utils/gamificationHelpers.js", () => ({
  updateUserStats: mockUpdateUserStats,
}));

// Mock: moderator 
const mockCheckText = jest.fn();
jest.unstable_mockModule("../utils/moderator.js", () => ({
  checkText: mockCheckText,
}));

// Helper 
const makeMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.headersSent = false;
  return res;
};

// Import controller AFTER all mocks are registered 
const { createPost, getFeed, likePost, addComment, deletePost, deleteComment } =
  await import("../controllers/socialController.js");

// createPost
describe("createPost", () => {
  const FIREBASE_UID = "firebase-user-001";
  const CAPTION = "Delicious pasta!";
  const IMAGE_URL = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
  const PUBLIC_ID = "sample";
  const userDoc = { _id: "mongo-user-id", username: "chef_mario" };

  const baseReq = {
    body: { user: FIREBASE_UID, caption: CAPTION },
    file: { path: IMAGE_URL, filename: PUBLIC_ID },
  };

  const goodAiResponse = {
    data: {
      data: {
        analysis: {
          responses: [{ prompt: "Does the image contain nudity?", value: "no" }],
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckText.mockResolvedValue(false);
    mockUserFindOne.mockResolvedValue(userDoc);
    mockPostSave.mockResolvedValue({ _id: "post-mongo-id-001" });
    mockUpdateUserStats.mockResolvedValue(true);
    mockAxiosPost.mockResolvedValue(goodAiResponse);
    mockPostFindByIdAndUpdate.mockResolvedValue(true);
  });

  test("creates post successfully and responds 201", async () => {
    const res = makeMockRes();
    await createPost(baseReq, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test("returns 400 when caption is toxic", async () => {
    mockCheckText.mockResolvedValue(true);
    const res = makeMockRes();
    await createPost(baseReq, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when no image file is provided", async () => {
    const req = { body: { user: FIREBASE_UID, caption: CAPTION }, file: null };
    const res = makeMockRes();
    await createPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No image file provided" });
  });

  test("returns 404 when user is not found in MongoDB", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const res = makeMockRes();
    await createPost(baseReq, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// getFeed
describe("getFeed", () => {
  const MOCK_POSTS = [
    { _id: "post1", caption: "Yummy ramen", user: "uid-1" },
    { _id: "post2", caption: "Great sushi", user: "uid-2" },
  ];

  const makeChainableFindMock = (resolvedValue) => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
    };
    chain.populate
      .mockImplementationOnce(() => chain)
      .mockResolvedValueOnce(resolvedValue);
    return chain;
  };

  beforeEach(() => jest.clearAllMocks());

  test("returns feed posts with status 200", async () => {
    mockUserFindOne.mockResolvedValue({ blockedUsers: [] });
    mockPostFind.mockReturnValue(makeChainableFindMock(MOCK_POSTS));
    const req = { query: { page: "1", uid: "current-uid" } };
    const res = makeMockRes();
    await getFeed(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(MOCK_POSTS);
  });

  test("excludes posts from blocked users", async () => {
    mockUserFindOne.mockResolvedValue({ blockedUsers: ["blocked-uid-1"] });
    mockPostFind.mockReturnValue(makeChainableFindMock([]));
    const req = { query: { uid: "current-uid" } };
    const res = makeMockRes();
    await getFeed(req, res);
    expect(mockPostFind).toHaveBeenCalledWith(
      expect.objectContaining({ user: { $nin: ["blocked-uid-1"] } })
    );
  });

  test("returns 500 on database error", async () => {
    mockUserFindOne.mockResolvedValue({ blockedUsers: [] });
    mockPostFind.mockImplementation(() => { throw new Error("DB error"); });
    const req = { query: { uid: "current-uid" } };
    const res = makeMockRes();
    await getFeed(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// likePost
describe("likePost", () => {
  const POST_ID = "post-mongo-123";
  const USER_ID = "liker-uid";

  const makePost = (likes = []) => ({
    _id: POST_ID,
    user: "author-uid",
    likes,
    updateOne: mockPostUpdateOne,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateUserStats.mockResolvedValue(true);
    mockPostUpdateOne.mockResolvedValue(true);
  });

  test("likes a post and returns 200", async () => {
    mockPostFindById.mockResolvedValue(makePost([]));
    mockUserFindOne.mockResolvedValue({ _id: "author-mongo-id", username: "chef" });
    const req = { params: { id: POST_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();
    await likePost(req, res);
    expect(mockPostUpdateOne).toHaveBeenCalledWith({ $push: { likes: USER_ID } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("Post liked!");
  });

  test("unlikes a post when user already liked it", async () => {
    mockPostFindById.mockResolvedValue(makePost([USER_ID]));
    mockUserFindOne.mockResolvedValue({ _id: "author-mongo-id", username: "chef" });
    const req = { params: { id: POST_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();
    await likePost(req, res);
    expect(mockPostUpdateOne).toHaveBeenCalledWith({ $pull: { likes: USER_ID } });
    expect(res.json).toHaveBeenCalledWith("Post unliked.");
  });

  test("returns 404 when post is not found", async () => {
    mockPostFindById.mockResolvedValue(null);
    const req = { params: { id: "ghost-id" }, body: { userId: USER_ID } };
    const res = makeMockRes();
    await likePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// addComment
describe("addComment", () => {
  const POST_ID = "post-mongo-abc";
  const USER_ID = "commenter-uid";
  const COMMENT_TEXT = "Looks amazing!";

  const updatedPost = {
    _id: POST_ID,
    user: { firebaseUid: "author-uid" },
    comments: [{ user: { username: "commenter" }, text: COMMENT_TEXT }],
  };

  const makeCommentChain = (resolved) => {
    const chain = { populate: jest.fn().mockReturnThis() };
    chain.populate
      .mockImplementationOnce(() => chain)
      .mockResolvedValueOnce(resolved);
    return chain;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckText.mockResolvedValue(false);
    mockUserFindOneAndUpdate.mockResolvedValue(true);
  });

  test("adds a comment and returns updated post with 200", async () => {
    mockPostFindByIdAndUpdate.mockReturnValue(makeCommentChain(updatedPost));
    const req = { params: { postId: POST_ID }, body: { userId: USER_ID, text: COMMENT_TEXT } };
    const res = makeMockRes();
    await addComment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedPost);
  });

  test("returns 400 when comment text is toxic", async () => {
    mockCheckText.mockResolvedValue(true);
    const req = { params: { postId: POST_ID }, body: { userId: USER_ID, text: "bad content" } };
    const res = makeMockRes();
    await addComment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPostFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("returns 404 when post is not found", async () => {
    mockPostFindByIdAndUpdate.mockReturnValue(makeCommentChain(null));
    const req = { params: { postId: POST_ID }, body: { userId: USER_ID, text: COMMENT_TEXT } };
    const res = makeMockRes();
    await addComment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// deletePost
describe("deletePost", () => {
  const POST_ID = "post-to-delete";
  const USER_ID = "owner-uid";

  beforeEach(() => jest.clearAllMocks());

  test("deletes post and returns 200 when owner requests deletion", async () => {
    mockPostFindById.mockResolvedValue({ _id: POST_ID, user: USER_ID });
    mockPostFindByIdAndDelete.mockResolvedValue(true);
    const req = { params: { postId: POST_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();
    await deletePost(req, res);
    expect(mockPostFindByIdAndDelete).toHaveBeenCalledWith(POST_ID);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("returns 403 when a non-owner tries to delete the post", async () => {
    mockPostFindById.mockResolvedValue({ _id: POST_ID, user: "actual-owner-uid" });
    const req = { params: { postId: POST_ID }, body: { userId: "intruder-uid" } };
    const res = makeMockRes();
    await deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockPostFindByIdAndDelete).not.toHaveBeenCalled();
  });

  test("returns 404 when post does not exist", async () => {
    mockPostFindById.mockResolvedValue(null);
    const req = { params: { postId: POST_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();
    await deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// deleteComment
describe("deleteComment", () => {
  const POST_ID = "post-abc";
  const COMMENT_ID = "comment-xyz";
  const USER_ID = "commenter-uid";
  const updatedPost = { _id: POST_ID, comments: [] };

  const makeDeleteCommentChain = (resolved) => ({
    populate: jest.fn().mockResolvedValue(resolved),
  });

  beforeEach(() => jest.clearAllMocks());

  test("deletes a comment and returns updated post with 200", async () => {
    mockPostFindOneAndUpdate.mockReturnValue(makeDeleteCommentChain(updatedPost));
    const req = { params: { postId: POST_ID, commentId: COMMENT_ID }, body: { userId: USER_ID } };
    const res = makeMockRes();
    await deleteComment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedPost);
  });

  test("returns 403 when user is not authorized", async () => {
    mockPostFindOneAndUpdate.mockReturnValue(makeDeleteCommentChain(null));
    const req = { params: { postId: POST_ID, commentId: COMMENT_ID }, body: { userId: "wrong-uid" } };
    const res = makeMockRes();
    await deleteComment(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
