var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '010912',
  database : 'opentutorials'
});
 
connection.connect();
 
connection.query('SELECT * from topic', function (error, results, fields) {
  if (error) {
    console.log(error);
  }
  console.log(results);
});
 
connection.end();