const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments,
} = require('../db/utils/utils');

describe('formatDates', () => {
  it('takes an empty array and returns a new empty array', () => {
    const input = [];
    const actual = formatDates(input);
    const expected = [];
    expect(actual).to.eql(expected);
    expect(actual).to.not.equal(input);
  });
  describe('it takes an array containing one object and...', () => {
    it('returns an array containing a new object', () => {
      const obj = {};
      const input = [obj];
      const actual = formatDates(input);
      const expected = [{}];
      expect(actual).to.eql(expected);
      expect(expected[0]).to.not.equal(obj);
    });
    it('returns an array containing an object with all the same properties as the object passed', () => {
      const obj = {title: "hello", body: "some interesting stuff"};
      const input = [obj];
      const actual = formatDates(input);
      expect(actual[0]).to.have.all.keys(Object.keys(obj));
    });
    it('must convert the timestamp property to a javascript date object', () => {
      const obj = {timestamp: 1542284514171};
      const input = [obj];
      const actual = formatDates(input);
      expect(actual[0].timestamp instanceof Date ).to.be.true;
    });
  });
  it('must do for an array of many objects, what it does for one', () => {
    const input = [{title: "hi", timestamp: 1542284514171}, {body: 'hello my name is', timestamp: 1542284514999}];
    const actual = formatDates(input);
    const expected = [{title: "hi", timestamp: new Date(1542284514171)}, {body: 'hello my name is', timestamp: new Date(1542284514999)}];
    expect(actual).to.eql(expected);
  });
});

describe('makeRefObj', () => {});

describe('formatComments', () => {});
