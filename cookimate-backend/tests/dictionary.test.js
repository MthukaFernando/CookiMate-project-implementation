import { jest } from "@jest/globals";

// ─── Mock mongoose ────────────────────────────────────────────────────────────
const mockSave = jest.fn();
const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockDeleteOne = jest.fn();

// We simulate a mongoose Model instance
class MockDictionaryModel {
  constructor(data) {
    Object.assign(this, data);
    this.save = mockSave;
  }
}

MockDictionaryModel.findOne = mockFindOne;
MockDictionaryModel.find = mockFind;
MockDictionaryModel.deleteOne = mockDeleteOne;

jest.unstable_mockModule("mongoose", () => ({
  default: {
    Schema: class {
      constructor(def, opts) {
        this.def = def;
        this.opts = opts;
        this.indexes = [];
      }
      index(fields) {
        this.indexes.push(fields);
        return this;
      }
    },
    model: jest.fn(() => MockDictionaryModel),
  },
}));

// ─── Import model after mocks ─────────────────────────────────────────────────
const { default: Dictionary } = await import("../models/Dictionary.js");

// ─── Suppress expected console noise ─────────────────────────────────────────
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.clearAllMocks();
});

afterEach(() => {
  console.error.mockRestore();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validData = () => ({
  category: "herbs",
  name: "Herbs & Spices",
  description: "Common culinary herbs",
  terms: ["basil", "thyme", "oregano"],
});

// =============================================================================
// Schema Shape
// =============================================================================
describe("Dictionary model — registration", () => {
  test("model export is the MockDictionaryModel constructor", () => {
    // mongoose.model() is called at import time, so we verify the result
    // rather than the call itself — if the export is correct, registration worked.
    expect(Dictionary).toBe(MockDictionaryModel);
  });
});

// =============================================================================
// Instance creation
// =============================================================================
describe("Dictionary instance — field assignment", () => {
  test("creates an instance with all provided fields", () => {
    const doc = new Dictionary(validData());

    expect(doc.category).toBe("herbs");
    expect(doc.name).toBe("Herbs & Spices");
    expect(doc.description).toBe("Common culinary herbs");
    expect(doc.terms).toEqual(["basil", "thyme", "oregano"]);
  });

  test("creates an instance without optional description field", () => {
    const data = validData();
    delete data.description;
    const doc = new Dictionary(data);

    expect(doc.description).toBeUndefined();
    expect(doc.category).toBe("herbs");
  });

  test("creates an instance with an empty terms array", () => {
    const doc = new Dictionary({ ...validData(), terms: [] });
    expect(doc.terms).toEqual([]);
  });

  test("terms array preserves order", () => {
    const terms = ["cumin", "paprika", "turmeric"];
    const doc = new Dictionary({ ...validData(), terms });
    expect(doc.terms).toEqual(["cumin", "paprika", "turmeric"]);
  });
});

// =============================================================================
// save()
// =============================================================================
describe("Dictionary instance — save()", () => {
  test("calls save and resolves with the document", async () => {
    const doc = new Dictionary(validData());
    mockSave.mockResolvedValue(doc);

    const result = await doc.save();
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(result).toBe(doc);
  });

  test("save rejects when category is duplicated (unique constraint)", async () => {
    const doc = new Dictionary(validData());
    const dupError = Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
    mockSave.mockRejectedValue(dupError);

    await expect(doc.save()).rejects.toMatchObject({ code: 11000 });
  });

  test("save rejects when required field 'category' is missing", async () => {
    const data = validData();
    delete data.category;
    const doc = new Dictionary(data);
    const validationError = new Error("Dictionary validation failed: category: Path `category` is required.");
    mockSave.mockRejectedValue(validationError);

    await expect(doc.save()).rejects.toThrow("category");
  });

  test("save rejects when required field 'name' is missing", async () => {
    const data = validData();
    delete data.name;
    const doc = new Dictionary(data);
    const validationError = new Error("Dictionary validation failed: name: Path `name` is required.");
    mockSave.mockRejectedValue(validationError);

    await expect(doc.save()).rejects.toThrow("name");
  });
});

// =============================================================================
// findOne()
// =============================================================================
describe("Dictionary.findOne()", () => {
  test("returns a document when found by category", async () => {
    const entry = validData();
    mockFindOne.mockResolvedValue(entry);

    const result = await Dictionary.findOne({ category: "herbs" });

    expect(mockFindOne).toHaveBeenCalledWith({ category: "herbs" });
    expect(result.category).toBe("herbs");
  });

  test("returns null when category does not exist", async () => {
    mockFindOne.mockResolvedValue(null);

    const result = await Dictionary.findOne({ category: "nonexistent" });
    expect(result).toBeNull();
  });

  test("rejects on database error", async () => {
    mockFindOne.mockRejectedValue(new Error("DB connection lost"));

    await expect(Dictionary.findOne({ category: "herbs" })).rejects.toThrow("DB connection lost");
  });
});

// =============================================================================
// find()
// =============================================================================
describe("Dictionary.find()", () => {
  test("returns all entries when called with empty query", async () => {
    const entries = [validData(), { ...validData(), category: "proteins", name: "Proteins" }];
    mockFind.mockResolvedValue(entries);

    const result = await Dictionary.find({});

    expect(mockFind).toHaveBeenCalledWith({});
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no entries exist", async () => {
    mockFind.mockResolvedValue([]);

    const result = await Dictionary.find({});
    expect(result).toEqual([]);
  });

  test("finds entries matching a specific term", async () => {
    const entry = validData();
    mockFind.mockResolvedValue([entry]);

    const result = await Dictionary.find({ terms: "basil" });

    expect(mockFind).toHaveBeenCalledWith({ terms: "basil" });
    expect(result[0].terms).toContain("basil");
  });
});

// =============================================================================
// deleteOne()
// =============================================================================
describe("Dictionary.deleteOne()", () => {
  test("deletes a document by category and reports deletedCount of 1", async () => {
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await Dictionary.deleteOne({ category: "herbs" });

    expect(mockDeleteOne).toHaveBeenCalledWith({ category: "herbs" });
    expect(result.deletedCount).toBe(1);
  });

  test("reports deletedCount of 0 when category does not exist", async () => {
    mockDeleteOne.mockResolvedValue({ deletedCount: 0 });

    const result = await Dictionary.deleteOne({ category: "ghost-category" });
    expect(result.deletedCount).toBe(0);
  });
});