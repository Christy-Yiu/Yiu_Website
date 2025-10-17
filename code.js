// var title= document.querySelector("h1");
 //title.innerHTML = "Welcome to my Website!";

 var Button = document.querySelector("#amongus");
 var Button2 = document.querySelector("#About");
 var Button3 = document.querySelector("#CV");

 Button.addEventListener("click", myfunction);
 Button2.addEventListener("click", alertabout);
 Button3.addEventListener("click", alertCV);


 
 var mynode = document.createElement("div");
 //change basic attributes
 mynode.id = "work1_intro";
 mynode.innerHTML = "This work is an exhibition";
 mynode.style.color = "Blue";

 //add event listener
 mynode.addEventListener("click", welcometowork1);
 document.querySelector("#work1").appendChild(mynode);


 function myfunction(){
    alert("A M O N G U S !");
 }

 //function alertabout(){
//    alert("uh i am a student hi how are you");
 //}

 function alertCV(){
    alert("I havent made my CV yet, come back later");
 }


 function welcometowork1(){
    mynode.innerHTML = "you touched the grid!";
 }