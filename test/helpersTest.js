const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('Function which searches an object for an email and returns the nested object', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    
    
    
    assert.equal(testUsers[expectedUserID].email, user.email);
  });

  it('should return undefined', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedUserID = undefined;
    
    assert.equal(expectedUserID, user);
  });
});