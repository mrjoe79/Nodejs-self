var http = require('http');             //http모듈을 포함하려면, require 메소드를 사용한다.
var fs = require('fs')                  //filesystem 모듈을 포함하려면, require 메소드를 사용한다.
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
  host     : '127.0.0.1',               //localhost 라고 쓰면 오류가 난다.
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
      db.query(`SELECT * from topic`, function (error, topics) {
        if (error) {
          throw error;
        }
        db.query(`SELECT * from topic left join author on topic.author_id=author.id where topic.id=?`, [queryData.id], function(error2, topic) {
          if (error2) {
            throw error2;
          }          
          var title = topic[0].title;
          var description = topic[0].description;  
          var list = template.List(topics);
          var html = template.HTML(title, list, 
            `<h2>${title}</h2> 
            ${description}
            <p> by ${topic[0].name} </p>
            `, 
            `<a href ="/create">create</a>
              <a href="/update?id=${queryData.id}">update</a>
              <form action="delete_process" method="post">
                <input type ="hidden" name="id" value="${queryData.id}">
                <input type ="submit" value="delete">
              </form>`
            );   
            response.writeHead(200);
            response.end(html);              
        })         
    });
    }      
  } else if(pathname === '/create') {
    db.query(`select * from topic`, function(error, topics){
      db.query(`select * from author`, function(error2, authors){
        var title = 'Create';      
        var list = template.List(topics);              //요거??
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title"></p>
            <p>
                <textarea name="description"></textarea>
            </p>
            <p>              
               ${template.authorSelect(authors)}              
            </p>
            <p>
                <input type = "submit">
            </p>
        </form>
      `, 
      `<a href="/create">create</a>`
      );   
        response.writeHead(200);
        response.end(html);  
      });             
  });
 } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`
          Insert into topic (title, description, created, author_id) 
          values(?, ?, now(), ?)`, 
          [post.title, post.description, post.author],
          function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {location: `/?id=${result.insertId}`});
            response.end();
           }
          )
      });      
    } else if(pathname === `/update`) {
      db.query(`select * from topic`, function(error,topics){      
          if(error){
          throw error;
        }
        db.query(`SELECT * from topic where id=?`, [queryData.id], function(error2, topic) { 
          if(error2){
            throw error2;
          }
          db.query(`select * from author`, function(error2, authors){
            var list = template.List(topics);
            var html = template.HTML(topic[0].title, list,                   
            `
            <form action="/update_process" method="post">
            <input type = "hidden" name = "id" value = ${topic[0].id}>
            <p><input type="text" name="title" value=${topic[0].title}></p>
            <p>
                <textarea name="description">${topic[0].description}</textarea>
            </p>
            <p>
              ${template.authorSelect(authors, topic[0].author_id)}
            </p>
            <p>
                <input type = "submit">
            </p>
        </form>
            `,
            `<a href ="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );  
            response.writeHead(200);
            response.end(html);
          });               
        
      }); 
     });
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`update topic set title=?, description=?, author_id=? where id=?`, [post.title, post.description, post.author, post.id], function(error, result){
              response.writeHead(302, {location: `/?id=${post.id}`});
              response.end();
          })
      });  
    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`delete from topic where id=?`, [post.id], function(error, result){
            if(error){
              throw error;
            }
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