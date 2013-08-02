alert('hi');
var dragSrcEl= null;
function handleDragStart(e) {
  this.style.opacity = '0.5';  // this / e.target is the source node.
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
  this.style.opacity='1.0';
}
function handleDrop(e) {
  if(dragSrcEl!= this){
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