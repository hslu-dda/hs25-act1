
## JSON, JavaScript Objekt Notation 
* Self HTML https://wiki.selfhtml.org/wiki/JSON
* https://javascript.info/json 

## JavaScript Object 
Damit aus einem JSON String ein JavaScript Object wird, muss der String geparst (=eingelesen) werden. In p5.js macht das die Funktion
```js
let dataObj;
function preload(){
    dataObj=loadJSON('pfadzumfile.json')
}
```
Wichtig, p5js gibt in jedem Fall ein Objekt zurück, auch wenn die JSON Notation ein Array war. Also aus Notation:

```js
[
  {
    "Indicator English": "Jobs are obtained without nepotism (and political connections?)",
    "Focus Group": "youth",
    "...
  },
  {
    "Indicator English": "A reasonable person does not want war",
    "Focus Group": "men",
    ...
  },
  ...
]

```

Wird ein Objekt:
```js
{
  {
    "Indicator English": "Jobs are obtained without nepotism (and political connections?)",
    "Focus Group": "youth",
    "...
  },
  {
    "Indicator English": "A reasonable person does not want war",
    "Focus Group": "men",
    ...
  },
  ...
}

```

## Zugriff auf Objekt
* `Object.keys(obj)` – gibt ein Array mit den keys zurück.
* `Object.values(obj)` – gibt ein Array mit den values zurück.
* `Object.entries(obj)` – gibt ein Array mit den [key, value] Paaren zurück.


## Loop durch Objekt
Das hat Relevanz auf die Art und Weise, wie wir durch die Daten loopen.<br/>
Wir können durch das Objekt loopen:
```js

//for Loop, schneller
for (let key in dataObj) {
   const row = dataObj[key];
}

//forEach, Kürzer & lesbarer
  Object.keys(dataObj).forEach((key) => {
    const row = dataObj[key];
  });

```
Oder wir können das Objekt in ein Array umwandeln:

```js

let dataArr = Object.values(dataObj);
//for Loop
for(let i=0;i<dataArr.length; i++){
    const row = dataObj[i];
}

//forEach
dataArr.forEach((row, index) => {
  console.log(index, row);
});
```
## Objekte transformieren

Objekten fehlen viele Methoden, die für Arrays verfügbar sind, z. B. map, filter und andere.
Wenn wir sie anwenden möchten, können wir Object.entries gefolgt von Object.fromEntries verwenden:
* Verwende Object.entries(obj), um ein Array mit Schlüssel/Wert-Paaren aus obj zu erhalten.
* Verwende Array-Methoden für dieses Array, z. B. map, um diese Schlüssel/Wert-Paare zu transformieren.
* Verwende Object.fromEntries(array) für das resultierende Array, um es wieder in ein Objekt umzuwandeln.

```js
let votes = {
  male: 1,
  female: 2,
  youth: 4,
  total:7
};

let percents= Object.entries(votes).map(entry => [entry[0], entry[1]/votes.total * 100])
console.log(Object.fromEntries(percents))

``` 
Sortieren
<br/>
Die JavaScript Funktion `filter` <a href="https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/filter">->Referenz</a> filtert ein Array, deshalb wird das Objekt zuerst in ein Array umgewandelt. 

```js 
// Object.values(rawData) gibt ein Array zurück
// filter(condition)
let rows = Object.values(rawData).filter(r => r.location === currentDataset);
```

## Datentyp Set
https://javascript.info/map-set#set <br/>
Der Set Konstruktor gibt ein Array zurück, in dem alle Werte bloss einmal vorkommen
<a href="https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Set/Set">->Referenz</a>

```js 
  let allLocations = ["blagajLT", "blagajLT", "blagajP", "blagajP", "zalikLT", "zalikLT", "zalikP"];
  let locations = [...new Set(allLocations)];
  console.log(locations);
  // jeder Wert kommt bloss einmal vor:
  //"blagajLT", "blagajP", "zalikLT", "zalikP" 

```