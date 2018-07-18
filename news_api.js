var scraperjs = require('scraperjs');

const cheerio = require('cheerio');

exports.removeItems = function(data, removeList){
	var $ = cheerio.load(data);
	for (var i = 0; i < removeList.length; i++) {
		try{
			$(removeList[i]).remove();
		}
		catch(e){
			console.log(e);
		}
	}
	return $.html();
}