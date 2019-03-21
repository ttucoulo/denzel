
const {MongoClient} = require('mongodb');
const CONNECTION_URL = "mongodb+srv://tititcl:password_8@denzel-0tcup.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "denzel";

module.exports = async () => {
  const client = await MongoClient.connect(CONNECTION_URL, {'useNewUrlParser': true});

  return {
    client,
    'db': client.db(DATABASE_NAME)
  };
};
