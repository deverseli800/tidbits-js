var dragSrcEl= null;
var newEl=null;

function handleDragCreate(e) {
  //make a new DOM element
  newEl=document.createElement("div");

  //give that element the tile class 
  newEl.classList.add("tile");
  newEl.classList.add("col-lg-4");
  //make this bitch draggable 
  var attrib= document.createAttribute('draggable');
  attrib.value="true";
  newEl.setAttributeNode(attrib);
  //add the innerHTML of the div we want
  //var node=document.createTextNode("This is a new paragraph.");

 // newEl.appendChild(node);
  newEl.innerHTML="<button>blah</button>";

  //set our dataTransfer options
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', newEl.innerHTML);

  //the other functions take this as a parameter so we should 
  //set our element to equal the dragSrcEl 
  dragSrcEl=newEl;
 
}

function handleNewDrop(e) {
  var element=document.getElementById("dashboard");
  element.appendChild(newEl);
  alert(newEl);
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
    alert('new');
    newEl=null;
    dragSrcEl=null;

  }
  else if((dragSrcEl!= this)||(dragSrcEl != newEl)){
    dragSrcEl.innerHTML = this.innerHTML;
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