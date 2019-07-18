const formatDates = list => {
  return list.map(({ created_at, ...restOfObject }) => {
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
  return comments.map(({ created_by, belongs_to, created_at, ...restOfKeys }) => {
    return { 
      author: created_by, 
      article_id: articleRef[belongs_to],
      created_at: new Date(created_at),
      ...restOfKeys };
  });
};

