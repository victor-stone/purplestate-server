var express = require('express');
var router = express.Router();


function getSH() {
  new Promise( function( resolve, reject ) {
    Spreadsheet.load({
      debug: true,
      oauth2: require('./cred'),
      spreadsheetName: 'Copy of Purple State Trips! (Responses)',
      worksheetName: 'Sheet1',
    }, function run(err, spreadsheet) {
      reject(err);

      spreadsheet.receive({getValues:false},function(err, rows, info) {
        reject(err);
        console.log("Found rows:", rows);
        console.log("With info:", info);
        resolve( { rows, info } );
      });
    });  

  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/pix', function(req, res, next) {
  getSH().then( model => res.json(model),
                err => res.json(err) );
});

module.exports = router;
