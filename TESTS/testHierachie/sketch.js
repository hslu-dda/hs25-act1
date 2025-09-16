let hierachie;

function preload(){
  hierachie=loadJSON("tree_combined.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight*3);

  let cellHeight=18;
  let rows=Object.entries(hierachie);

  translate(20,20);
  let zeile=0;
  for(let i=0;i<rows.length;i++){
    const dim = rows[i][0];
    
    push();
    translate(10,(zeile)*cellHeight);
    text(dim, 0,0);
    pop();

    const mainNode = rows[i][1];
    for(let j=0;j<mainNode.length;j++){
      push();
      translate(210, (zeile)*cellHeight);
      const main=mainNode[j].CODE;
      text(main, 0,0);
      pop();

      console.log(mainNode[j].children);

      const subNode = mainNode[j].children;

      for(let n=0;n<subNode.length;n++){
        push();
        translate(410, (zeile)*cellHeight);
        text(subNode[n].CODE, 0,0);
        zeile++;
        pop();
      }
      zeile++;
    }

    
      
    zeile++;
    
  }


}
