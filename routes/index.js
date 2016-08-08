var express = require('express');
var router = express.Router();
var Spreadsheet = require('edit-google-spreadsheet');


function getSH() {
  return new Promise( function( resolve, reject ) {
    var opts = {
      debug: true,
      oauth2: require('../auth'),
      spreadsheetId: require('../sheetId'),
      worksheetName: 'Form Responses 1',
    };

    Spreadsheet.load(opts, function(err, spreadsheet) {
      if( err ) {reject(err);}

      try {
        spreadsheet.receive({getValues:false},function(err, rows, info) {
          if( err ) {reject(err);}
          resolve( { rows, info } );
        });
      } catch(e) {
        reject(e);
      }
    });  

  });
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/pix', function(req, res, next) {
  getSH().then( model => res.json(model),
                err => res.json(err) ).catch(e => { console.log(e); res.json(err) });
});


module.exports = router;
