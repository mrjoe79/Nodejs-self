/*
function a(){
    console.log('A');
}
a();   
*/


var a = function (){            // 자바스크립트에서는 함수가 a라는 변수에 들어가는 값이 될 수 있다.
    console.log('A');
}

function slowfunc(callback){    //slowfunc 함수의 callback 파라미터가 들어가고, slowfunc의 a라는 값을 넣으면 A가 실행됨
    callback();                     
}

slowfunc(a);                    //callback 함수는 파라미터가 반드시 '함수'인 함수. 즉, var a 는 함수이다.
