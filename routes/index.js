
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Home' });
};

exports.place = function(req, res){
  res.render('place', { title: 'Dashboard' });
};
exports.team = function(req, res){
  res.render('team', { title: 'Team' });
};

exports.dragDrop = function(req, res){
  res.render('dragDrop', { title: 'Team' });
};