const functions = require("./functions");

const cascadeDelete = async (prisma, modelName: String, where) => {
    const info =await functions.getDeletionInfo(prisma, modelName,where);
    console.log(info)
    await prisma.$transaction(info.map(inf=>functions.createDeletions(prisma,inf)))
};

module.exports = { cascadeDelete };
