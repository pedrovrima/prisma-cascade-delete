# Prisma Cascade Delete

[Prisma](https://www.prisma.io/) (v2) is one of the hottest ORM's right now (you can see some of the reasion I think so [here](https://twitter.com/pmartinsdev/status/1390028038046457862)). It still has some important holes, though. Cascade delete is one of the most proeminent ones, and most of the "automatic" workarounds have some issue.

This package exposes a **cascadeDelete** function that uses the information available at the _prisma models_ to perform cascade deletes on **one-to-many** and **many-to-many** (with a relation table) relations. The cascade goes as deep as the relation goes (see example below).

## Installation

```
npm install prisma-cascade-delete
```

## Usage

```javascript
import { cascadeDelete } from "prisma-cascade-delete";

cascadeDelete(prisma, modelName, where);
// prisma is the prisma-client instance from your app
// modelName must be the same as used in the prisma schema (e.g. "User")
// where is an object accepted by prisma queries as a *where* statement
```

## Example

```javascript
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  viewCount Int      @default(0)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Tag {
  id        Int      @id @default(autoincrement())
  name      String
}

model TagsInPost {
    id       Int     @id @default(autoincrement())
    post     Post    @relation(fields: [postId], references: [id])
    postId   Int
    tag      Tag     @relation(fields: [tagId], references: [id])
    tagId    Int

}

```

In the schema above, we would expect that if we delete a User, all its Posts and all the Tags associated to this posts would be deleted as well. However, there is no way to set this up.

That's where **cascadeDelete** comes in;

```javascript
import { cascadeDelete } from "prisma-cascade-delete";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cascadeDelete(prisma, "User", { id: 1 });
```

This function will generate

```javascript
const userDelete = prisma.user.delete({ where: { id: 1 } });
const postsDelete = prisma.post.deleteMany({ where: { userId: 1 } });
const postTagDelete = prisma.tagsInPost.deleteMany({
  where: { OR: [{ postId: 1 }, { postId: 2 }] },
}); 
// Imagining that the user posted posts 1 and 2

prisma.$transaction([postTageDelete,postsDelete,userDelete])

```
