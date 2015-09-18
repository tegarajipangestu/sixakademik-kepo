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

  kodekuliah = req.query.kode;
  programstudi = req.query.ps;
  kelas = req.query.kelas;

  templateurl = 'https://six.akademik.itb.ac.id/publik/'
  daftarkelasurl = 'daftarkelas.php?ps='+programstudi+'&semester=1&tahun=2015&th_kur=2013'

  console.log(kodekuliah);
  console.log(programstudi);
  console.log(templateurl+daftarkelasurl);


  request(templateurl+daftarkelasurl, function(error, response, html)
  {

    if(!error && response.statusCode == 200)
    {
      var $ = cheerio.load(html);
      var text = "";

      $('ol').children('li').each(function(index){
        var text = $(this).contents().filter(function(){ 
         return this.nodeType == 3; 
       })[0].nodeValue;

        if (text.substr(0, text.indexOf(" ")).toLowerCase() === kodekuliah.toLowerCase()){

          detailkelasurl = $(this).find('ul > li:nth-child('+kelas.substr(1,1)+') > a').attr('href');
          console.log(templateurl+detailkelasurl);

          request(templateurl+detailkelasurl, function(error, response, html)
          {
            var $ = cheerio.load(html);
            text = $('pre').text();
            console.log(text);
            res.send(text);

            var jsonOutput = {};
            jsonOutput['coba'] = 'coba';

            var string = "{\"key\":\"value\"}";
            var obj = JSON.parse(string);
            var output = "{'Fakultas' : 'hubahuba'}";
            console.log(jsonOutput);
            // res.send(output);
          })
        }
      })
    }
    else if (!error && response.statusCode==404)
    {
      res.status(404).send("Tidak ditemukan kelas dengan kode "+kodekuliah); 
    }
    else if (response.statusCode==500)
    {
      res.status(500).send("Terjadi kesalahan pada server"); 
    }

  })


});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


