const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const DENZEL_IMDB_ID = 'nm0000243';
const imdb = require('./sandbox').Sandbox;
const getDB = require('./get-db');
const CONNECTION_URL = "mongodb+srv://tititcl:password_8@denzel-0tcup.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "denzel";
const graphqlHTTP = require('express-graphql');
const schema = require('./schema')

var app = Express();
async function start(){
    app.use(BodyParser.json());
    app.use(BodyParser.urlencoded({ extended: true }));
    
    
    app.use(BodyParser.json());
    app.use(BodyParser.urlencoded({ extended: true }));
    
    const {db} =  await getDB();
    const collection =  await db.collection('movies');
    
    app.use('/graphql', graphqlHTTP({
        schema,
        'context':{collection},
        'graphiql': true
    }));
        
    app.listen(3000, () => {
        console.log("server listening on port " + 3000);
    });

    
    app.get("/movies", (request, response) => {
        db.collection("movies").find({}).toArray((err, res) => {
            if (err) return res.status(500).send(err);
            response.send(res);
        })
    });
    
    app.get("/movies/populate", (request, response) => {
        try {
            db.collection("movies").drop();
            console.log("db dropped successfully");
        }
        catch (e) {
            console.log(e);
        }
        imdb.sandbox(DENZEL_IMDB_ID).then(movies => {
            db.collection("movies").insertMany(movies, (err, res) => {
                if (err) return status(500).send(err);
                response.json(res);
            });
    
        })
    });
    
    app.get("/movies/search", (request, response) => {
        var limit = Number(request.query.limit) || 5;
        var metascore = Number(request.query.metascore) || 0;
    
        db.collection("movies").aggregate([
            { "$match": { "metascore": { "$gte": metascore } } },
            { "$sample": { "size": limit } }
        ]).toArray((err, res) => {
            if (err) return status(500).send(err);
            response.json({ "limit": limit, "metascore": metascore, "results": res });
        })
    });
    
    app.get("/movies/:id", (request, response) => {
        db.collection("movies").findOne({ "id": request.params.id }, (err, res) => {
            if (err) return status(500).send(err);
            response.json(res);
        });
    });
    
    
    app.post("/movies/:id", (request, response) => {
        var review = request.body.review;
        var date = request.body.date;
    
        db.collection("movies").update({"id": request.params.id},{ $set:
          {"review": review,
            "date": date
          }
        },(err, res) => {
            if(err) {
                return response.status(500).send(error);
            }
            response.send(res);
        } );
    });
}

start();
   
