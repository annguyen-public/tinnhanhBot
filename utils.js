var fs = require('fs'),
    request = require('request');

exports.download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

exports.delete_file = function(filename, callback){
	fs.unlink(filename, (err) => {
	  if (err) throw err;
	  console.log(filename + ' was deleted');
	});
}