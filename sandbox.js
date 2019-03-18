/* eslint-disable no-console, no-process-exit */
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
var Sandbox = function(){};

Sandbox.prototype.sandbox = async (actor) => {
  try {
    console.log(`📽️  fetching filmography of ${actor}...`);
    const movies = await imdb(actor);
    const awesome = movies.filter(movie => movie.metascore >= 77);
    
    console.log(`🍿 ${movies.length} movies found.`);
    console.log(JSON.stringify(movies, null, 2));
    console.log(`🥇 ${awesome.length} awesome movies found.`);
    console.log(JSON.stringify(awesome, null, 2));
    return movies;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

exports.Sandbox = new Sandbox();
