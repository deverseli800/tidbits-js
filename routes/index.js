
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.place = function(req, res){
  res.render('place', { title: 'Express' });
};