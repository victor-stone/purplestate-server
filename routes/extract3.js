'use strict';
const http = require ('http');
const fs = require ('fs');
const jsdom = require ('jsdom');
const mkdirp = require('mkdirp');

const stateColor = {
  'California': 'darkblue',
  'Hawaii': 'darkblue',
  'Massachusetts': 'darkblue',
  'Connecticut': 'darkblue',
  'Vermont': 'darkblue',
  'Washington': 'lightblue',
  'Oregon': 'lightblue',
  'Illinois': 'lightblue',
  'New York': 'lightblue',
  'New Mexico': 'lightblue',
  'Maine': 'lightblue',
  'Maryland': 'lightblue',
  'New Jersey': 'lightblue',
  'Nevada': 'purple',
  'North Carolina': 'purple',
  'Ohio': 'purple',
  'Wisconsin': 'purple',
  'Florida': 'purple',
  'Colorado': 'purple',
  'Iowa': 'purple',
  'Michigan': 'purple',
  'New Hampshire': 'purple',
  'Virginia': 'purple',
  'Missouri': 'lightred',
  'Pennsylvania': 'purple',
  'Minnesota': 'lightblue',
  'Georgia': 'lightred',
  'Arizona': 'lightred',
  'Texas': 'lightred',
  'Montana': 'lightred',
  'Nebraska': 'lightred',
  'South Dakota': 'lightred',
  'Kentucky': 'lightred',
  'Indiana': 'lightred',
  'Arkansas': 'darkred',
  'Idaho': 'darkred',
  'Louisiana': 'darkred',
  'Kansas': 'darkred',
  'West Virginia': 'darkred'
};

console.log('getting data');

const scrape =  () => {
  let data = '';
  let req = http.get ('http://movement2016.org', (res) => {
    res.on ('data', (chunk) => { data += chunk; });
    res.on ('end', () => { 
      console.log( 'got end');
      processPage (data); 
    });
  });
  req.on ('error', (error) => {
    console.log ('Fetch error', error);
  });
  req.end ();
}

function processPage (data) {
  mainPageParser (data, (groups) => {

    console.log( 'in parser callback', groups );

    // convert HTML tags to characters (&amp. &nbsp.)
    for (let group of groups) {
      group.name = fix (group.name);
      group.description = fix (group.description);
    }

    mkdirp('./public/data', err => {
      if( err ) {
        console.log( 'mkdirp err: ', err );
      } else {
        // save JSON file
        fs.writeFile('./public/data/groups.json', JSON.stringify (groups, null, 2), err => {
          if( err ) {
            console.log('error writing json', err);
          } else {
            // prepare and write CSV file
            let lines = [];
            lines.push ('"id","name","state","urlWeb","urlGive","description","tags","color"');
            for (let group of groups) {
              lines.push (`"${group.id}","${group.name}","${group.state}","${group.urlWeb}",` +
                `"${group.urlGive}","${group.description}","${group.tags}","${group.color}"`);
            }
            fs.writeFileSync ('./public/data/groups.csv', lines.join ('\n'), err = {
              if( err ) {
                console.log('error writing csv', err );
              }
            });      
          }
        });        
      }
    });

  });
}

function mainPageParser (input, callback) {
  console.log( 'parsing...');
  let id = 0;
  let groups = [];
  jsdom.env (input,
    ['http://code.jquery.com/jquery.js'],
    function (errors, window) {
      let $ = window.jQuery;
      $('.state').each (function () {
        let state = $(this).find ('.state-title').text ().trim ();
        $(this).find ('.group').each (function () {
          let classes = $(this).attr ('class');
          let name = $(this).find ('.group-title').text ();
          let urlWeb, urlGive;
          $(this).find ('.group-link').each (function () {
            if (urlWeb) {
              urlGive = $(this).attr ('href');
            } else {
              urlWeb = $(this).attr ('href');
            }
          });
          let description = $(this).find ('.group-content').text ();
          description = description.replace (/[\r\n]/g, ' ');
          description = description.trim ();
          description = description.replace (/\u0003/g, '');

          // select only tags from class list
          let tagList = classes.split (' ').filter (item => {
            return ((item !== 'group') && (item !== ''));
          });
          let tags = tagList.join (',');

          id ++;
          groups.push ({
            id: id,
            name: name,
            state: state,
            urlWeb: (urlWeb) ? urlWeb : '',
            urlGive: (urlGive) ? urlGive : '',
            description: description,
            tags: tags,
            color: stateColor[state]
          });
        });
      });
      callback (groups);
    }
  );
}

function fix (text) {
  let result = text.replace (/&amp;/g,'&');
  result = result.replace (/&nbsp;/g,' ');
  return (result);
}

module.exports = scrape;
