var http = require('http');             //http모듈을 포함하려면, require 메소드를 사용한다.
var fs = require('fs')                  //filesystem 모듈을 포함하려면, require 메소드를 사용한다.
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB2</a></h1>
    ${list}
    <a href ="/create">create</a>
    ${body}
  </body>
  </html>
  `; 
}
function templateList(filelist){
  var list =  '<ul>';
  var i = 0;
    while(i<filelist.length){
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i+1;
    }
    list = list+'</ul>';
    return list;
}

var app = http.createServer (function(request, response){     //var http = require('http'); 
    var _url = request.url;             //console.log(_url)을 찍어보면, id?HTML라는 값이 _url 변수에 담겨짐
    var queryData = url.parse(_url, true).query;    //url 변수에 들어온 쿼리 스트링 값을 분석(parse)하여 queryData 변수에 대입 {id : 'HTML'}
    var pathname = url.parse(_url, true).pathname;       // pathname 은 '/' 를 담음 {pathname : '/'}
    if (pathname === '/') {                              // 3000포트 실행해보면, pathname은 무조건 '/'이 출력  
      if (queryData.id == undefined) {                    // 메인페이지라는 뜻 (예: http://localhost:3000/)
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = templateList(filelist);              //요거??
          var template = templateHTML(title, list, `<h2>${title}</h2> ${description}`);   //요거??
          response.writeHead(200);
          response.end(template);                  
        });
    } else {
      fs.readdir('./data', function(error, filelist){       
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;           //HTML만 추출
          var list = templateList(filelist);
          var template = templateHTML(title, list, `<h2>${title}</h2> ${description}`);  
          response.writeHead(200);
          response.end(template);
      }); 
     });
    }      
  } else if(pathname === '/create') {
    fs.readdir('./data', function(error, filelist){
      var title = 'WEB - create';      
      var list = templateList(filelist);              //요거??
      var template = templateHTML(title, list, `
        <form action="http://localhost:3000/create_process" method="post">
          <p><input type="text" name="title"></p>
          <p>
              <textarea name="description"></textarea>
          </p>
          <p>
              <input type = "submit">
          </p>
      </form>
    `);   //요거??
      response.writeHead(200);
      response.end(template);               
  });
 } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description
      });
      response.writeHead(200);
      response.end('success');
    } else {
      response.writeHead(404);
      response.end('Not found'); 
  } 
        
    
 
});
app.listen(3000);