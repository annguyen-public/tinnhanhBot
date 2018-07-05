var MongoClient = require('mongodb').MongoClient;
const db_name = 'vuivuinews';
var url = "mongodb://vuivui:vuivui123@ds016108.mlab.com:16108/" + db_name;

exports.updateDB = function updateDB(collection, record, query, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(db_name);
      record.timestamp = new Date();
      dbo.collection(collection).update(query, record, { upsert: true }, function(err, res) {
        db.close();
        if(err) 
	      // execute the callback for a null result and an error.
	      callback(err);
	    else
	      // execute the callback on the result
	      callback(null);
      });
    });
}

exports.findDB = async function(collection, query, callback){
	return new Promise(function (resolve, reject) {
		MongoClient.connect(url, function(err, db) {
	      if (err) reject(err);
	      var dbo = db.db(db_name);

	      dbo.collection(collection).findOne(query, function(err, result) {
	        db.close();
	        if(err){ 
		      // execute the callback for a null result and an error.
		      callback(err, null);
		      reject(err);
		  	}
		    else{
		      // execute the callback on the result
		      callback(null, result);
		      resolve(result);
		  	}
	      });
	    });
	});
}