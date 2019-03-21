const { makeExecutableSchema } = require('graphql-tools');
const retry = require('async-retry');

const typeDefs = [`
type Query {
    movies: [Movie]
    search(metascore: Int, limit: Int): [Movie]
    findid(id: String): [Movie]
    movie: Movie
  }
type Mutation{
    commentary(review: String, date: String, id: String): [Movie]
}
  
  type Movie {
    id: String
    link: String
    metascore: Int
    synopsis: String
    title: String
    year: Int
  }
  schema {
    query: Query,
    mutation: Mutation
  }`
];

const resolvers = {
    'Query': {
        'movies': async (obj, args, context) => {
            const { collection } = context;
            return await retry(async () => {
                return await collection.find({}).toArray();
            }, { 'retries': 5 });
        },
        'search': async (obj, args, context) => {
            const { collection } = context;
            var limit = Number(args.limit) || 5;
            var metascore = Number(args.metascore) || 0;

            return await retry(async () => {
                return await collection.aggregate([
                    { "$match": { "metascore": { "$gte": metascore } } },
                    { "$sample": { "size": limit } }
                ]).toArray();
            }, { 'retries': 5 });
        },
        'findid': async (obj, args, context) => {
            const { collection } = context;
            var id = String(args.id);

            return await retry(async () => {
                return await collection.find({ "id": id }).toArray();
            }, { 'retries': 5 });
        },
    },
    //ne fonctionne pas
    'Mutation': {
        'commentary': async (obj, args, context) => {
            const { collection } = context;
            var review = String(args.review);
            var date = String(args.date);
            var id = String(args.id);
            
            return await retry(async () => {
                return await collection.updateOne({"id": id},{ $set:
                    {"review": review,
                      "date": date
                    }
                  });
            });
        },
    }
};

module.exports = makeExecutableSchema({
    typeDefs,
    resolvers
});
