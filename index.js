var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

String.prototype.matchAll = function(regexp) {
  var matches = [];
  this.replace(regexp, function() {
    var arr = ([]).slice.call(arguments, 0);
    var extras = arr.splice(-2);
    arr.index = extras[0];
    arr.input = extras[1];
    matches.push(arr);
  });
  return matches.length ? matches : null;
};

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

            metadata_regex = /(.*?)\n(?:Program Studi\s\s:\s)(.*)\n(?:Semester\s\s:\s)(.{1})(?:\/)(.*)\n\n(?:Kode\/Mata Kuliah\s:\s)(.{6})(?:\s\/\s)(.*)(?:,)(\s.)(?:\sSKS)\n(?:No\.\sKelas\/Dosen\s\s:\s)(.{2})(?:\s\/\s)(.*)\n\n(?:-----------------------------------------------------------)\n(?:No\.   NIM         NAMA)\n(?:-----------------------------------------------------------)\n(?:.\n*)*\n(?:-----------------------------------------------------------)\n(?:Total\sPeserta\s=\s)(.{2})/g;
            studentnim_regex = /([\d]{8})   (.*)/g;
            // res.send(text);

            var result = metadata_regex.exec(text);
            // var student_result = text.matchAll(studentnim_regex);
            // res.send(student_result);

            // console.log(text);
            // console.log(regex)

            var jsonOutput = {};
            // console.log(result);

            jsonOutput['fakultas'] = result[1];
            jsonOutput['prodi'] = result[2];
            jsonOutput['semester'] = result[3];
            jsonOutput['tahun'] = result[4];
            jsonOutput['kode'] = result[5];
            jsonOutput['mata_kuliah'] = result[6];
            jsonOutput['sks'] = result[7];
            jsonOutput['kelas'] = result[8];
            jsonOutput['dosen'] = result[9];
            jsonOutput['jumlah peserta'] = result[10];
            jsonOutput['peserta'] = [];
            // $.each(student_result, function(i,val))
            do {
              match = studentnim_regex.exec(text);
              if (match)
              {
                jsonOutput['peserta'].push({
                  nim: match[1],
                  nama: match[2].trim()
                });                
              }
            }
            while (match);
            res.send(jsonOutput);
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


