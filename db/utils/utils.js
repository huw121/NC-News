exports.formatDates = list => {
  return list.map(object => {
    const { timestamp, ...restOfObject } = object;
    return timestamp ? {
      timestamp: new Date(timestamp),
      ...restOfObject
    } : { ...restOfObject }
  });
};

exports.makeRefObj = list => { };

exports.formatComments = (comments, articleRef) => { };
