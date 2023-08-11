var coordinatesSpan = document.getElementById("coordinates");
var coordinates = [0, 0];
window.onmessage = function(e){
    // if(e.origin !== "http://localhost:8081"){
    // if(e.origin !== location.origin){
    //     return;
    // }
    if(e.origin != "null"){
        //  return;
    }
    if(isNaN(e.data[0]) || isNaN(e.data[1])){
        return;
    }
    coordinatesSpan.innerText = e.data[0] + ", " + e.data[1];
    coordinates = e.data;
};