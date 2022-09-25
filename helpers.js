const getUserbyEmail = function(userEmail, database) {
  for (let user in database) {  // Check if user email is already in database
    if (database[user].email === userEmail) {
      return database[user];
    } 
  }
};

module.exports = { getUserbyEmail };