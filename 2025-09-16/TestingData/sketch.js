let rawData;
function preload(){
    rawData=loadJSON("../../data/auszug-data.json")
}
function setup(){
    createCanvas(400,400);

    //console.log(rawData)

    let keys= Object.keys(rawData);
    let values = Object.values(rawData);
    let entries = Object.entries(rawData);

    console.log("values"+values);

   /* let filtered = values.filter((e) => e.Community =="blagajP");
    console.log(filtered);*/

    let filtered = values.filter(function(e){
        return e.Community=="blagajP";
    } )

    let filteredDim = values.filter(e => e["Dimension 1"] =="Culture & Society");
    //console.log(filteredDim);

    let selected = values.map((e) => e["Dimension 1"]);
    console.log(selected);

    let unique = [...new Set(selected)];
    console.log(unique);

}

function draw(){

}