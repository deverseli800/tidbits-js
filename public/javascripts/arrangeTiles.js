var dragSrcEl= null;
var newEl=null;

function handleDragCreate(e) {
  //make a new DOM element
  newEl=document.createElement("div");
  newEl.addEventListener('dragstart', handleDragStart,false);
  newEl.addEventListener('dragenter', handleDragEnter, false);
  newEl.addEventListener('dragleave', handleDragLeave, false);
  newEl.addEventListener('dragover', handleDragOver, false);
  newEl.addEventListener('dragend', handleDragEnd, false);
  newEl.addEventListener('drop', handleDrop, false);

  //give that element the tile class 
  newEl.classList.add("tile");
  newEl.classList.add("col-lg-12");

  //make this bitch draggable 
  var attrib= document.createAttribute('draggable');
  attrib.value="true";
  newEl.setAttributeNode(attrib);
  //add the innerHTML of the div we want
  newEl.innerHTML="<div class='tileHead'><div class='type'><i class='icon-bar-chart'></i></div>Orderbook<div class='options'><div class='option'><i class='icon-remove'></i></div></div></div><canvas id='myChart' width=1200 height=350></canvas>";

  //set our dataTransfer options
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', newEl.innerHTML);

  //the other functions take this as a parameter so we should 
  //set our element to equal the dragSrcEl 
  dragSrcEl=newEl;
 
}

function handleDragStart(e) {
  this.style.opacity = '0.5';  // this / e.target is the source node.
  this.classList.add('source');
  dragSrcEl=this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}
function handleDragOver(e) {
  e.preventDefault();

}
function handleDragEnter(e) {
  this.classList.add('over');
}
function handleDragLeave(e) {
  this.classList.remove('over');
}
function handleDragEnd(e) {
  this.classList.remove('over');
  this.classList.remove('source');
  this.style.opacity='1.0';
}
function handleDrop(e) {
  if(dragSrcEl==newEl) {
    var element=this.parentNode;
    element.appendChild(newEl);
    newEl=null;
  }
  else if((dragSrcEl!= this)||(dragSrcEl != newEl)){
    //source element takes innerHTML of element it is dropping on to
    dragSrcEl.innerHTML = this.innerHTML;
    
    //handle different size columns by storing class attributes 
    var srcClass=this.className;

    //the element being dropped on 
    this.className=dragSrcEl.className;
    dragSrcEl.className=srcClass;
    this.classList.remove('source');
    this.innerHTML = e.dataTransfer.getData('text/html');

    }
  
  this.classList.remove('over');
}

var tiles = document.querySelectorAll('.tile');
[].forEach.call(tiles, function(tile) {
    tile.addEventListener('dragstart', handleDragStart, false);
    tile.addEventListener('dragenter', handleDragEnter, false);
    tile.addEventListener('dragleave', handleDragLeave, false);
    tile.addEventListener('dragover', handleDragOver, false);
    tile.addEventListener('dragend', handleDragEnd, false);
    tile.addEventListener('drop', handleDrop, false);
});

var newTiles= document.querySelectorAll('.newTile');
[].forEach.call(newTiles, function(newTile) {
  newTile.addEventListener('dragstart', handleDragCreate, false);
});