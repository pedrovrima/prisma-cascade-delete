interface Deletion {
  modelName: string;
  where: object;
  level: number;
}

interface CascadeInfo {
  parentId: string;
}




const getDeletionInfo = async (prisma, modelName:string, where)=>{
  const pre_cascade = await getCascade(prisma,modelName,1,where)
  console.log(pre_cascade)
  const cascade = sortDeletions(flatCascade(pre_cascade));
  return cascade

}


const createDeletions = (prisma, delete_object: Deletion) => {
  const { modelName, where, level } = delete_object;
  const deleteFunction = level == 1 ? "delete" : "deleteMany";
  const expanded_where = expandWhere(where);
  return prisma[decaptalize(modelName)][deleteFunction]({
      where: expanded_where,
    });
};

const decaptalize = (string: string): string => {
  const first = string[0];
  const rest = string.substring(1);
  const decap_first = first.toLowerCase();
  return decap_first + rest;
};

const fieldsFilter = (fild): boolean =>
  fild.kind === "object" && fild.relationFromFields.length == 0;

const getFields = (prisma, modelName: string) => {
  const fields = prisma._dmmf.modelMap[modelName].fields
  return fields;
};

const getIdField = (prisma, modelName: string): string => {
  const fields = getFields(prisma, modelName);
  const idField = fields.filter((fld) => fld.isId);
  console.log(idField);
  return idField[0].name;
};

const getId = async (prisma, modelName: string, idField: string, where) => {
  console.log(idField,where);
  const idValue = await Promise.all([
    prisma[modelName].findMany({ where, select: {[idField]:true} }),
  ]);
  const ids = idValue[0].map((val) => val[idField]);
  return ids;
};

const getRelationInfo = (fields, parentModelName: string) => {
  const parentField = fields.filter((fil) => fil.type == parentModelName)[0];
  const { relationToFields, relationFromFields } = parentField;
  return {
    parentIdName: relationToFields[0],
    thisIdName: relationFromFields[0],
  };
};

const getCascadeInfo = async (
  prisma,
  fields,
  parentModelName: string,
  parentWhere
) => {
  const { parentIdName, thisIdName } = getRelationInfo(fields, parentModelName);
  if (parentIdName) {
    console.log(parentIdName)
    const parentId = await getId(
      prisma,
      decaptalize(parentModelName),
      parentIdName,
      parentWhere
    );
    return { [thisIdName]: parentId };
  } else {
    return;
  }
};

// const checkCascade = (
//   prisma,
//   parentModelName: string,
//   thisModelName: string
// ) => {
//   const fields = getFields(prisma, thisModelName);
//   const isCascade = getCascadeInfo(parentModelName, fields);
// };

const getCascade = async (prisma, modelName: string, level: number, where) => {
  const fields = getFields(prisma, modelName);
  const possible_cascade = fields.filter((fild) => fieldsFilter(fild));
  // Has possible cascade??
  // Yes: Check it
  if (possible_cascade.length > 0) {
    const cascade = await Promise.all(
      possible_cascade.map(async (pca) => {
        const fields = getFields(prisma, pca.type);
        const cascadeWhere = await getCascadeInfo(
          prisma,
          fields,
          modelName,
          where
        );

        // Is it a real cascade?
        // Yes: return it and check for new cascade

        if (cascadeWhere) {
          const sub_cascade = await getCascade(
            prisma,
            pca.type,
            level + 1,
            cascadeWhere
          );
          return sub_cascade;
        } else {
          //  return nothing
          return;
        }
      })
    );
    return [{ modelName, where, level }, ...cascade];
  } else {
    // No: Return info
    return [{ modelName, where, level }];
  }
};

const flatCascade = (arr) => arr.flat(Infinity);

const createOr = (where, key: string) => {
  if (where[key].length > 1) {
    const whereOr = where[key].map((whr) => {
      return { [key]: whr };
    });
    return { OR: whereOr };
  } else {
    return { [key]: where[key][0] };
  }
};

const expandWhere = (where) => {
  const key = Object.keys(where)[0];
  const isArray = Array.isArray(where[key]);
  if (isArray) {
    return createOr(where, key);
  } else {
    return where;
  }
};

const sortDeletions = (deletions: [Deletion]): [Deletion] => {
  const sorted_deletions = deletions.sort((a, b) => b.level - a.level);
  return sorted_deletions
};




module.exports = {
  createDeletions,
  decaptalize,
  getFields,
  getCascadeInfo,
  getCascade,
  flatCascade,
  createOr,
  expandWhere,
  sortDeletions,
  getDeletionInfo
};
