const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const DENZEL_IMDB_ID = 'nm0000243';
const imdb = require('./sandbox').Sandbox;

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

const CONNECTION_URL = "mongodb+srv://tititcl:password_8@denzel-0tcup.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "denzel";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;
/*
async function sandbox(actor) {
    try {
        const movies = await imdb(actor);
        resolve(movies);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}*/

    app.listen(3000, () => {
        MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
            if (error) {
                throw error;
            }
            database = client.db(DATABASE_NAME);
            collection = database.collection("people");
            console.log("Connected to `" + DATABASE_NAME + "`!");
        });
    });

    app.get("/movies", (request, response) => {
        database.collection("movies").find({}).toArray((err, res) => {
            if(err) return res.status(500).send(err);
            response.send(res);
        })
    });

    app.get("/movies/populate", (request, response) => {
        try {
            database.collection("movies").drop();
            console.log("db dropped successfully");
        }
        catch (e) {
            console.log(e);
        }
        imdb.sandbox(DENZEL_IMDB_ID).then(movies => {
            database.collection("movies").insertMany(movies, (err, res) => {
                if(err) return status(500).send(err);
                response.json(res);
            });
            
        })
    });

    app.get("/movies/:id", (request, response) => {
        database.collection("movies").findOne({ "id": request.params.id }, (err, res) => {
            if(err) return status(500).send(err);
            response.json(res);
        });
    });

    app.get("/movies/search", (request, response) => {
        var limit = Number(request.query.limit) || 5;
        var metascore = Number(request.query.metascore) || 70;

        if(limit || metascore){
            database.collection("movies").aggregate([
                {"$match" : {"metascore" : {"$gte" : metascore}}},
                {"$sample" : {"size" : limit}}
            ]).toArray((err, res) =>{
                if(err) return status(500).send(err);
                response.json({"limit" : limit, "metascore" : metascore, "results" : res});
            })
        }
    });
