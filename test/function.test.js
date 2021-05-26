const functions = require("../src/functions");

const prisma = {
  _dmmf: {
    modelMaps: {
      User: {
        fields: [
            {
              name: "id",
              kind: "scalar",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: true,
              isReadOnly: false,
              type: "Int",
              hasDefaultValue: true,
              default: { name: "autoincrement", args: [] },
              isGenerated: false,
              isUpdatedAt: false,
            },
            {
              name: "posts",
              kind: "object",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              type: "Posts",
              hasDefaultValue: false,
              relationName: "UserPosts",
              relationFromFields: [],
              relationToFields: [],
              relationOnDelete: "NONE",
              isGenerated: false,
              isUpdatedAt: false,
            },
          ],
        },
      },
      Posts: {
        fields: {
          models: [
            {
              name: "id",
              kind: "scalar",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: true,
              isReadOnly: false,
              type: "Int",
              hasDefaultValue: true,
              default: { name: "autoincrement", args: [] },
              isGenerated: false,
              isUpdatedAt: false,
            },
            {
              name: "user",
              kind: "object",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              type: "User",
              hasDefaultValue: false,
              relationName: "UserPosts",
              relationFromFields: ["userId"],
              relationToFields: ["id"],
              relationOnDelete: "NONE",
              isGenerated: false,
              isUpdatedAt: false,
            },
            {
              name: "userId",
              kind: "scalar",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: false,
              isReadOnly: true,
              type: "Int",
              hasDefaultValue: false,
              isGenerated: false,
              isUpdatedAt: false,
            },
            {
              name: "tags",
              kind: "object",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              type: "Tags",
              hasDefaultValue: false,
              relationName: "UserPosts",
              relationFromFields: [],
              relationToFields: [],
              relationOnDelete: "NONE",
              isGenerated: false,
              isUpdatedAt: false,
            },
          ],
        },
      },
      Tags: {
        fields: {
          models: [
            {
              name: "id",
              kind: "scalar",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: true,
              isReadOnly: false,
              type: "Int",
              hasDefaultValue: true,
              default: { name: "autoincrement", args: [] },
              isGenerated: false,
              isUpdatedAt: false,
            },
            {
              name: "posts",
              kind: "object",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              type: "Posts",
              hasDefaultValue: false,
              relationName: "PostTags",
              relationFromFields: ["postId"],
              relationToFields: ["id"],
              relationOnDelete: "NONE",
              isGenerated: false,
              isUpdatedAt: false,
            },
            {
              name: "postId",
              kind: "scalar",
              isList: false,
              isRequired: true,
              isUnique: false,
              isId: false,
              isReadOnly: true,
              type: "Int",
              hasDefaultValue: false,
              isGenerated: false,
              isUpdatedAt: false,
            },
          ],
        
      },
    },
  },
  user: {
    delete: (...args) => {
      return { name: "delete", args };
    },
    deleteMany: (...args) => {
      return { name: "deleteMany", args };
    },
    findMany: (...args) => {
      return [{ id: 1 }];
    },
  },
  posts: {
    deleteMany: (...args) => {
      return { name: "deleteMany", args };
    },
    delete: (...args) => {
      return { name: "delete", args };
    },
    findMany: (...args) => {
      return [{ id: 5 }];
    },
  },
  tags: {
    deleteMany: (...args) => {
      return { name: "deleteMany", args };
    },
    delete: (...args) => {
      return { name: "delete", args };
    },
    findMany: (...args) => {
      return [{ id: 5 }];
    },
  },
};

//  createDeletions

test("delete level 1", () => {
  const deletion = functions.createDeletions(prisma, {
    level: 1,
    modelName: "User",
    where: { id: 1 },
  });
  expect(deletion).toEqual({ name: "delete", args: [{ where: { id: 1 } }] });
});

test("delete level 1", () => {
  const deletion = functions.createDeletions(prisma, {
    level: 3,
    modelName: "Tags",
    where: { id: [1, 2, 3] },
  });
  expect(deletion).toEqual({
    name: "deleteMany",
    args: [{ where: { OR: [{ id: 1 }, { id: 2 }, { id: 3 }] } }],
  });
});

test("delete level 2", () => {
  const deletion = functions.createDeletions(prisma, {
    level: 2,
    modelName: "Posts",
    where: { id: 1 },
  });
  expect(deletion).toEqual({
    name: "deleteMany",
    args: [{ where: { id: 1 } }],
  });
});

// decaptalize

test("decaptalize", () => {
  expect(functions.decaptalize("Hello")).toEqual("hello");
});

test("decaptalize", () => {
  expect(functions.decaptalize("HelloWorld")).toEqual("helloWorld");
});

// getFields

test("get user fields", () => {
  expect(functions.getFields(prisma, "User")).toEqual([
    {
      name: "id",
      kind: "scalar",
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: true,
      isReadOnly: false,
      type: "Int",
      hasDefaultValue: true,
      default: { name: "autoincrement", args: [] },
      isGenerated: false,
      isUpdatedAt: false,
    },
    {
      name: "posts",
      kind: "object",
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: "Posts",
      hasDefaultValue: false,
      relationName: "UserPosts",
      relationFromFields: [],
      relationToFields: [],
      relationOnDelete: "NONE",
      isGenerated: false,
      isUpdatedAt: false,
    },
  ]);
});

// getCascadeInfo

test("getCascadeInfo", () => {
  const fields = functions.getFields(prisma, "Posts");
  functions
    .getCascadeInfo(prisma, fields, "User", { id: 1 })
    .then((res) => expect(res).toEqual({ where: { userId: [1] } }));
});

// flatCascade

test("flatcascade", () => {
  expect(functions.flatCascade([1, [2, [3]]])).toEqual([1, 2, 3]);
});

// getCascadeInfo

test("getCascade", async () => {
  const cascade = await functions.getCascade(prisma, "User", 1, { id: 1 });
  expect(cascade).toEqual([
    { level: 1, modelName: "User", where: { id: 1 } },
    [
      { level: 2, modelName: "Posts", where: { userId: [1] } },
      [{ level: 3, modelName: "Tags", where: { postId: [5] } }],
    ],
  ]);
});

// createOr

test("createOr array 1 element", () => {
  expect(functions.createOr({ id: [1] }, "id")).toEqual({ id: 1 });
});

test("createOr array 2 elements", () => {
  expect(functions.createOr({ id: [1, 2] }, "id")).toEqual({
    OR: [{ id: 1 }, { id: 2 }],
  });
});

// expandWhere
test("expandWhere object 1 element", () => {
  expect(functions.expandWhere({ id: 1 })).toEqual({ id: 1 });
});

test("expandWhere array 1 element", () => {
  expect(functions.expandWhere({ id: [1] })).toEqual({ id: 1 });
});

test("expandWhere array 2 elements", () => {
  expect(functions.expandWhere({ id: [1, 2] })).toEqual({
    OR: [{ id: 1 }, { id: 2 }],
  });
});

// sortDeletion

test("sortDeletion", () => {
  expect(
    functions.sortDeletions([
      { level: 1, modelName: "User", where: { id: 1 } },

      { level: 2, modelName: "Posts", where: { userId: [1] } },
      { level: 3, modelName: "Tags", where: { postId: [5] } },
    ])
  ).toEqual([
    { level: 3, modelName: "Tags", where: { postId: [5] } },
    { level: 2, modelName: "Posts", where: { userId: [1] } },
    { level: 1, modelName: "User", where: { id: 1 } },
  ]);
});
