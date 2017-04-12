var Jquery = require('jquery');
var Nightmare = require('nightmare');
var fs = require('fs');
var http = require('http');
var vo = require('vo');

var bdd = 'pagejaune.json';
var resultats = [];
//var url = 'http://pain-noir-pain-blanc.fr/';

// function to remove duplicates in an array
var duplicate = function (arr) {
    return arr.filter(function(el, i) {
      return arr.indexOf(el) === i;
    });
};
// enlever // pour voir Electron en action ! 
var nightmare = Nightmare ({ show: true });

var run = function * (url) {
  try {
	yield nightmare
	.goto(url)
  	.wait('body')
    .evaluate(function () {

      var regexpMail = /[\w\.-]*@[\w\.-]*\.[\w\.-]*/g; // http://regexr.com/
      var regexpNum = /0\d\s\d{2}\s\d{2}\s\d{2}\s\d{2}/g; // /0[\s\d]{6,12}\d/g;

      var d2 = new Date();
      var time = d2.getTime();

      var html = document.body.innerHTML;
      var title = document.title;
      var url = window.location.href;

      // Use of regExp
      var mail = html.match(regexpMail);
      var num = html.match(regexpNum);

      return {
        title: title,
        mail: mail,
        num: num,
        time: time,
        url: url
      }
    })
    .then(function (res) {

      // Time of running script
      var d3 = new Date();
      var time2 = d3.getTime();
      console.log(time2 - res.time);
      res.time = time2 - res.time;

      // drop out duplicates 
      if (res.num !== null) {
        res.num = duplicate(res.num);
      }
      if (res.mail !== null) {
      res.mail = duplicate(res.mail);
      }
      // displaying results
      console.log(res);
      resultats.push(res);  
    })
    
    yield nightmare
          .click('a[href*="contact"]')
          .evaluate(function () {

            var regexpMail = /[\w\.-]*@[\w\.-]*\.[\w\.-]*/g; // http://regexr.com/
            var regexpNum = /0\d\s\d{2}\s\d{2}\s\d{2}\s\d{2}/g; // /0[\s\d]{6,12}\d/g;

            var d2 = new Date();
            var time = d2.getTime();

            var html = document.body.innerHTML;
            var title = document.title;
            var url = window.location.href;

            // Use of regExp
            var mail = html.match(regexpMail);
            var num = html.match(regexpNum);

            return {
              title: title,
              mail: mail,
              num: num,
              time: time,
              url: url
            }
          })
          .then(function (r) {
            resultats[0].mail === null ? resultats[0].mail = r.mail : resultats[0].mail.push(r.mail);
            console.log(resultats);
          })        
    
    yield nightmare
          .end();

} catch (e) {
  console.log(e);
}
finally {
  return resultats;
}
};

var hunter = function(url) {
  vo(run)(url, function(err, titles) {
  var obj = JSON.stringify(titles, null, '\t');
  fs.open(bdd, 'a+', function(err, fd) {
    fs.write(fd, obj, function(err) {
    if(err) {
      console.log(err);
    }
    else {
      console.log('Written with success!');
      fs.close(fd, function() {
        console.log("the server is close");
      });
  }
});
  });

  fs.readFile(bdd, 'utf8', function (err, data) { // on commence à reformater le fichier final
  if (err) {
    console.log(err);
  }
  var result = data.replace(/}\s*]\[\s*{/g, '},\n\t{' ); // replace '][' with good format

  fs.writeFile(bdd, result, 'utf8', function (err) {
     if (err) {
      console.log(err);
    } else {
      console.log('Modified with success!');
    }
  });
});
});
};

module.exports = hunter;



