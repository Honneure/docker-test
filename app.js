var vo = require('vo');

const hunter = require('./scrapjaune');

const urls = ['http://www.versaillesforme.com/', 'http://www.liberte-patisserie-boulangerie.com/'];

var runThemAll = function * () {
urls.forEach((el) => {
  yield hunter(el);
});}

vo(runThemAll)(function(err, titles) {
  console.dir(titles);
});