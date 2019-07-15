const formatDates = list => {
  return list.map(object => {
    const { created_at, ...restOfObject } = object;
    return created_at ? {
      created_at: new Date(created_at),
      ...restOfObject
    } : { ...restOfObject }
  });
};

exports.formatDates = formatDates;

exports.makeRefObj = (list, prop, val) => {
  return list.reduce((acc, object) => {
    acc[object[prop]] = object[val];
    return acc;
  }, {})
};

exports.formatComments = (comments, articleRef) => {
  return formatDates(comments.map(comment => {
    const { created_by, belongs_to, ...restOfKeys } = comment;
    return { author: created_by, article_id: articleRef[belongs_to], ...restOfKeys };
  }));
};

