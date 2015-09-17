var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res){

  kodekuliah = req.params.kode;
  programstudi = req.params.ps;
  kelas = req.params.kelas;


  templateurl = 'https://six.akademik.itb.ac.id/publik/'
  daftarkelasurl = 'daftarkelas.php?ps=135&semester=1&tahun=2015&th_kur=2013'

  request(templateurl+daftarkelasurl, function(error, response, html){

    if(!error){
      var $ = cheerio.load(html);

      $('ol').children('li').each(function(index){
       var text = $(this).contents().filter(function(){ 
         return this.nodeType == 3; 
       })[0].nodeValue;
       if (text.substr(0, text.indexOf(" ")).toLowerCase() === kodekuliah.toLowerCase())
       {
        link = $(this).find('ul > li:first-child > a').attr('href');
        res.end(templateurl+link);
      }

    })
      res.end("Not found");
    }


  })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


