var scraperjs = require('scraperjs');

const cheerio = require('cheerio');

exports.removeItems = function(data, removeList){
	var $ = cheerio.load(data);
	for (var i = 0; i < removeList.length; i++) {
		$(removeList[i]).remove();
	}
	return $.html();
}