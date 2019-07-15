exports.formatDates = list => {
  return list.map(object => {
    const { created_at, ...restOfObject } = object;
    return created_at ? {
      created_at: new Date(created_at),
      ...restOfObject
    } : { ...restOfObject }
  });
};

exports.makeRefObj = list => { };

exports.formatComments = (comments, articleRef) => { };
