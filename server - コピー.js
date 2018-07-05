var express = require('express');
var app = express();
const db_name = 'nine_db';
var request = require("request");

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://nineuser:123@ds133550.mlab.com:33550/" + db_name;

var scraperjs = require('scraperjs');
var ultils = require("./utils.js");
var wp_api = require("./wp_api.js");
var news_api = require("./news_api.js");

const TOTAL_NUM = 10;

var news_list = ["Zing.vn", "Báo Lao Động", "Đài Tiếng Nói Việt Nam", "Vietnamnet.vn", "Báo Dân Việt", "Bóng đá 24h", "Bóng Đá +", "Saostar (lời tuyên bố phát cho các báo) (Blog)", "Tin tức 24h"];

var vovRemoveList = [""];


var trends = require('node-google-search-trends');
trends('Vietnam', TOTAL_NUM, function(err, data) {
    if (err) return console.err(err);
    scrapeUploadItAll(data);
});

async function scrapeUploadItAll(dataArray){
  for (var i = 0; i < TOTAL_NUM; i++) {
    await scapeAndUpload(dataArray[i]);
  }
}

function scapeAndUpload(data){
  if(!news_list.includes(data['ht:news_item'][0]['ht:news_item_source'][0])){
    return;
  }
  var postData = {title: data['ht:news_item'][0]['ht:news_item_title'][0], categories: 2};

  //console.log(data['ht:news_item'][0]);

  var news_content_sign = get_news_content_sign(data['ht:news_item'][0]['ht:news_item_source'][0]);

  scraperjs.StaticScraper.create(data['ht:news_item'][0]['ht:news_item_url'][0])
  .scrape(function($) {
    return $(news_content_sign).map(function() {
      return $(this).html();
    }).get();
  })
  .then(function(news) {
    postData.content = news_api.removeItems(news[0]);

    var featured_media_sign = get_news_image_sign(data['ht:news_item'][0]['ht:news_item_source'][0]);
    scraperjs.StaticScraper.create(data['ht:news_item'][0]['ht:news_item_url'][0])
    .scrape(function($) {
      return $(featured_media_sign).map(function() {
        return $(this).attr('src');
      }).get();
    })
    .then(function(news) {
      //console.log(news[0]);
      postData.featured_media = news[0];     
      //console.log(postData.featured_media);
      console.log('posted!');
      //wp_api.postToWP(postData);
    })
  })
}

function get_news_content_sign(site){
  var sign = "";
  switch(site){
    case news_list[0]:
      sign = ".the-article-body"; break;  //Zing.vn
    case news_list[1]:
      sign = ".article-content"; break; //Báo Lao Động
    case news_list[2]:
      sign = "#article-body"; break;  //Đài Tiếng Nói Việt Nam
    case news_list[3]:
      sign = "#ArticleContent"; break;  //Vietnamnet.vn
    case news_list[4]:
      sign = ".contentbaiviet"; break;  //Báo Dân Việt
    case news_list[5]:
      sign = ".entry"; break; //Bóng đá 24h
    case news_list[6]:
      sign = ".content"; break; //Bóng Đá +
    case news_list[7]:
      sign = "#content_detail"; break;  //Saostar
    case news_list[8]:
      sign = ".nwsHt"; break; //Tin tức 24h
  }
  return sign;
}

function get_news_image_sign(site){
  var sign = "";
  switch(site){
    case news_list[0]:
      sign = ".the-article-body img"; break;  //Zing.vn
    case news_list[1]:
      sign = ".article-content img"; break; //Báo Lao Động
    case news_list[2]:
      sign = "#article-body img"; break;  //Đài Tiếng Nói Việt Nam
    case news_list[3]:
      sign = ".FmsArticleBoxStyle-Images img"; break; //Vietnamnet.vn
    case news_list[4]:
      sign = ".news-image"; break;  //Báo Dân Việt
    case news_list[5]:
      sign = ".entry img"; break; //Bóng đá 24h
    case news_list[6]:
      sign = ".content img"; break; //Bóng Đá +
    case news_list[7]:
      sign = "#content_detail img"; break;  //Saostar
    case news_list[8]:
      sign = ".nwsHt img"; break; //Tin tức 24h
  }
  return sign;
}

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("tinnhanh bot listening at http://%s:%s", host, port)

});	