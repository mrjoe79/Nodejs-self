var number = [1,345,7,4345,89, 6456];
var total = 0;
var i = 0;
while(i< number.length){
    total = total + number[i];
    i = i+1;
}
console.log(`total : ${total}`);