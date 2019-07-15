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
      const obj = { title: "hello", body: "some interesting stuff" };
      const input = [obj];
      const actual = formatDates(input);
      expect(actual[0]).to.have.all.keys(Object.keys(obj));
    });
    it('must convert the created_at property to a javascript date object', () => {
      const obj = { created_at: 1542284514171 };
      const input = [obj];
      const actual = formatDates(input);
      expect(actual[0].created_at instanceof Date).to.be.true;
    });
    it('must not mutate the original input', () => {
      const obj = { created_at: 1542284514171 };
      const input = [obj];
      const copyInput = [...input];
      formatDates(input);
      expect(copyInput).to.eql(input);
    });
  });
  it('must do for an array of many objects, what it does for one', () => {
    const input = [{ title: "hi", created_at: 1542284514171 }, { body: 'hello my name is', created_at: 1542284514999 }];
    const actual = formatDates(input);
    const expected = [{ title: "hi", created_at: new Date(1542284514171) }, { body: 'hello my name is', created_at: new Date(1542284514999) }];
    expect(actual).to.eql(expected);
  });
});

describe('makeRefObj', () => {
  it('returns an empty object when passed an empty array', () => {
    const input = [];
    const actual = makeRefObj(input);
    const expected = {};
    expect(actual).to.eql(expected);
  });
  it('takes a one object array, a prop and a val and turns it into an appropriate lookup', () => {
    const input = [{ name: 'huw', age: 12 }];
    const actual = makeRefObj(input, 'name', 'age');
    const expected = { huw: 12 };
    expect(actual).to.eql(expected);
  });
  it('takes a multiple object array, a prop and a val and turns it into an appropriate lookup', () => {
    const input = [{ name: 'huw', arms: '12' }, { name: 'bob', arms: '2' }];
    const actual = makeRefObj(input, 'name', 'arms');
    const expected = { huw: '12', bob: '2' };
    expect(actual).to.eql(expected);
  });
});

describe('formatComments', () => {
  it('should return a new empty array when passed an empty array', () => {
    const input = [];
    const actual = formatComments(input);
    const expected = [];
    expect(actual).to.eql(expected);
    expect(actual).to.not.equal(input);
  });
  describe('for one comment in an array, formatComments should...', () => {
    it('should rename the created_by key to author', () => {
      const input = [{ created_by: 'huw', created_at: 1542284514171, belongs_to: 'cheese' }];
      const lookup = { 'cheese': 1 }
      const actual = formatComments(input, lookup);
      expect(actual[0].author).to.equal('huw');
      expect(actual[0]).to.not.have.keys('created_by');
    });
    it('should reformated the value of created_at key to be a javascipt date object', () => {
      const input = [{ created_by: 'huw', created_at: 1542284514171, belongs_to: 'cheese' }];
      const lookup = { 'cheese': 1 }
      const actual = formatComments(input, lookup);
      expect(actual[0].created_at).to.eql(new Date(1542284514171));
    });
    it('should rename the belongs_to key to article_id and use a passed lookupRef to convert the belongs_to value to an id', () => {
      const input = [{ created_by: 'huw', created_at: 1542284514171, belongs_to: 'cheese' }];
      const lookup = { 'cheese': 1 }
      const actual = formatComments(input, lookup);
      expect(actual[0].article_id).to.equal(1);
      expect(actual[0]).to.not.have.keys('belongs_to');
    });
    it('should not mutate the original array or object', () => {
      const obj = { created_by: 'huw', created_at: 1542284514171, belongs_to: 'cheese' };
      const objCopy = { ...obj };
      const input = [obj]
      const inputCopy = [...input];
      const lookup = { 'cheese': 1 }
      formatComments(input, lookup);
      expect(input).to.eql(inputCopy);
      expect(obj).to.eql(objCopy);
    });
    it('should preserve other properties', () => {
      const input = [{ created_by: 'huw', created_at: 1542284514171, belongs_to: 'cheese', body: 'hello lets talk about cheese' }];
      const lookup = { 'cheese': 1 }
      const actual = formatComments(input, lookup);
      expect(actual[0].body).to.equal('hello lets talk about cheese')
    });
    it('does all the above at once', () => {
      const input = [{ created_by: 'huw', created_at: 1542284514171, belongs_to: 'cheese', body: 'hello lets talk about cheese' }];
      const lookup = { cheese: 1 }
      const actual = formatComments(input, lookup);
      const expected = [{ author: 'huw', created_at: new Date(1542284514171), article_id: 1, body: 'hello lets talk about cheese' }];
      expect(actual).to.eql(expected);
    });
  });
  it('should do everything it does for one but for many, ', () => {
    const input = [{ created_by: 'huw', created_at: 1542284514171, belongs_to: 'cheese', body: 'hello lets talk about cheese' },
    { created_by: 'bob', created_at: 1542284514999, belongs_to: 'dogs', body: 'hello lets talk about dogs' }];
    const lookup = { cheese: 1, dogs: 2 }
    const actual = formatComments(input, lookup);
    const expected = [{ author: 'huw', created_at: new Date(1542284514171), article_id: 1, body: 'hello lets talk about cheese' },
    { author: 'bob', created_at: new Date(1542284514999), article_id: 2, body: 'hello lets talk about dogs' }];
    expect(actual).to.eql(expected);
  });
});
