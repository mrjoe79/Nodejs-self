var http = require('http');             //http모듈을 포함하려면, require 메소드를 사용한다.
var fs = require('fs')                  //filesystem 모듈을 포함하려면, require 메소드를 사용한다.
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '010912',
  database : 'opentutorials'
});



var app = http.createServer (function(request, response){     //var http = require('http'); 
    var _url = request.url;             //console.log(_url)을 찍어보면, id?HTML라는 값이 _url 변수에 담겨짐
    var queryData = url.parse(_url, true).query;    //url 변수에 들어온 쿼리 스트링 값을 분석(parse)하여 queryData 변수에 대입 {id : 'HTML'}
    var pathname = url.parse(_url, true).pathname;       // pathname 은 '/' 를 담음 {pathname : '/'}
    if (pathname === '/') {                              // 3000포트 실행해보면, pathname은 무조건 '/'이 출력  
      if (queryData.id == undefined) {                    // 메인페이지라는 뜻 (예: http://localhost:3000/)
/*         fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';

          var list = template.List(filelist);              //요거??
          var html = template.HTML(title, list, 
            `<h2>${title}</h2> ${description}`, 
            `<a href ="/create">create</a>`
            );   //요거??
          response.writeHead(200);
          response.end(html);                 

        }); */
        db.query('SELECT * from topic', function (error, topics) {
            console.log(topics);
            var title = 'Welcome';
            var description = 'Hello, Node.js';  
            var list = template.List(topics);
            var html = template.HTML(title, list, 
              `<h2>${title}</h2> ${description}`, 
              `<a href ="/create">create</a>`
              );   
            response.writeHead(200);
            response.end(html);                 
        });
    } else {
      fs.readdir('./data', function(error, filelist){    
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;           //HTML만 추출
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description);
          var list = template.List(filelist);
          var html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2> ${sanitizedDescription}`,
          ` <a href ="/create">create</a> 
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action="delete_process" method="post">
              <input type ="hidden" name="id" value="${sanitizedTitle}">
              <input type ="submit" value="delete">
            </form>
            `
          );  
          response.writeHead(200);
          response.end(html);
      }); 
     });
    }      
  } else if(pathname === '/create') {
    fs.readdir('./data', function(error, filelist){
      var title = 'WEB - create';      
      var list = template.List(filelist);              //요거??
      var html = template.HTML(title, list, `
        <form action="/create_process" method="post">
          <p><input type="text" name="title"></p>
          <p>
              <textarea name="description"></textarea>
          </p>
          <p>
              <input type = "submit">
          </p>
      </form>
    `, '');   //요거??
      response.writeHead(200);
      response.end(html);               
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
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {location: `/?id=${title}`});
            response.end();
          })
      });      
    } else if(pathname === `/update`) {
      fs.readdir('./data', function(error, filelist){     
        var filteredId = path.parse(queryData.id).base;  
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;           //HTML만 추출
          var list = template.List(filelist);
          var html = template.HTML(title, list,                   
          `
          <form action="/update_process" method="post">
          <input type = "hidden" name = "id" value = ${title}>
          <p><input type="text" name="title" value=${title}></p>
          <p>
              <textarea name="description">${description}</textarea>
          </p>
          <p>
              <input type = "submit">
          </p>
      </form>
          `,
          `<a href ="/create">create</a> <a href="/update?id=${title}">update</a>`
          );  
          response.writeHead(200);
          response.end(html);
      }); 
     });
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {location: `/?id=${title}`});
              response.end();
            })
          });
      });  
    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {location: `/`});
            response.end();
          })  
      });  
    } else {
      response.writeHead(404);
      response.end('Not found'); 
  } 
        
    
 
});
app.listen(3000);