var express = require('express');
var app = express();

var scraperjs = require('scraperjs');
var ultils = require("./utils.js");
var wp_api = require("./wp_api.js");
var news_api = require("./news_api.js");
var db_api = require("./db_api.js");

const TOTAL_NUM = 5;
const test_item = 2;

var news_list = ["Zing.vn", "Báo Lao Động", "Đài Tiếng Nói Việt Nam", "Vietnamnet.vn", "Báo Dân Việt", "Bóng đá 24h", "Bóng Đá +",
 "Saostar (lời tuyên bố phát cho các báo) (Blog)", "Tin tức 24h", "Thể Thao 247 (lời tuyên bố phát cho các báo)", "VTC News", "Kênh 14"/*, "Dân Trí"*/];

var vovRemoveList = ["#ctl00_mainContent_ctl00_pnMeta", ".social-button", ".cms-relate", ".related-events", ".box--sponsor", ".article-relate-bottom", ".ads", ".relate-right", ".position-code", ".author", "script", ".relate", ".gallery-pagination", ".meta"];
var thethao247RemoveList = [".box_author", ".bread_cump", ".share_time", ".box_sponsor", ".soucre_news", ".box_tag_detail", ".head_video_index", ".list_news_ft", ".content_bottom_index", "#ads_content", "#video-ads-show", "#AdAsia", ".ads"];
var vtcRemoveList = [".post-date", ".tintin", ".explus_related_1404022217", ".adv", ".like-share", ".grid-list", "#cmt", ".breakAd2", "footer", ".single-tags"];
var vietnamnetRemoveList = [".ArticleDateTime", ".article-relate", ".inner-article", ".inner-article", ".VnnAdsPos", ".m-b-10", "#Box-FixFB", "#listComment", "script", ".logo-small", ".LiveTabBar", ".BoxBottom", ".ListArticle", ".fmsSurvey"];
var zingnewsRemoveList = [".the-article-meta", ".inner-article", ".the-article-comment", ".sidebar", ".the-article-credit", ".the-article-tags"];
var kenh14RemoveList = [".kbwc-meta", ".kbwc-socials", ".kmnw-content", ".relationnews", ".knc-rate-link", ".post_embed", "script", ".klw-nomargin", ".klw-new-socials", ".klw-nomargin", ".detail-bottom-ads", ".ads-sponsor", ".adm-commentsection", ".adm_sponsor_footer1", "#k14-detail-stream", ".klw-body-bottom"];
//var dantriRemoveList = [".box26", ".top-sharing", "script", ""];
var danvietRemoveList = [".datetimeup", ".tinlienquan", ".tintin", ".nguonbaiviet", ".tukhoa", ".bannerbaiviet", "script", "#fb-root", ".numbercmmt", "#authorize-button", "#form_gui_binh_luan", "#noi_dung_binh_luan"];
var dummiRemoveList = [""];
var tintuc24hRemoveList = [".icoSocial", ".content-bv-lq", ".updTm", ".sbNws"];
var bongda24hRemoveList = [".post-meta", ".ads", ".list-entry", "script", ".articlerelatepannel", "iframe", ".facebookbinhluan", ".dieu-huong", ".like-fb-gogle", ".tin-lien-quan", ".box-conten-cat", "#fb-root", ""];


//ultils.delete_file('333.jpg');

function start(){
  var date = new Date();
  console.log("start at" + date.toTimeString());
  var trends = require('node-google-search-trends');
  trends('Vietnam', TOTAL_NUM, function(err, data) {
      if (err) return console.err(err);
      scrapeUploadItAll(data);
  });
}

var startToRun = setInterval(function () {
  try{
    start();
  }
  catch(e){
    console.log(e);
  }
}, 300000);

async function scrapeUploadItAll(dataArray){
  for (var i = 0; i < TOTAL_NUM; i++) {
    //if(i == (test_item - 1))
    var query = {'url': dataArray[i]['ht:news_item'][0]['ht:news_item_url'][0]};
    await db_api.findDB('visited_url', query, function(err, result){
      if(err == null){
        if(!result){
          try{
            scapeAndUpload(dataArray[i]);
          }
          catch(e){
            console.log(e);
          }
          //console.log(i);
        }
      }
    });
    //await scapeAndUpload(dataArray[i]);
  }
}

function scapeAndUpload(data){
  //parse data
  var news_source = data['ht:news_item'][0]['ht:news_item_source'][0];
  var news_title = data['ht:news_item'][0]['ht:news_item_title'][0];
  var news_url = data['ht:news_item'][0]['ht:news_item_url'][0];

  if(!news_list.includes(news_source)){
    return;
  }
  console.log(news_source);
  var postData = {title: news_title, categories: 3};

  //console.log(data['ht:news_item'][0]);

  var news_content_sign = get_news_content_sign(news_source);

  scraperjs.StaticScraper.create(news_url)
  .scrape(function($) {
    return $(news_content_sign).map(function() {
      return $(this).html();
    }).get();
  })
  .then(function(news) {
    var removeList = get_new_removelist(news_source);
    postData.content = news_api.removeItems(news[0], removeList);
    //postData.content = news[0];

    var featured_media_sign = get_news_image_sign(news_source);
    scraperjs.StaticScraper.create(news_url)
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
      //saveToFile(postData.content);
      wp_api.postToWP(postData);
      //wp_api.test()
      //console.log(news_url);

      var record = {url: news_url};
      var query = {'url': record.url};
      db_api.updateDB('visited_url', record, query, function(err){
        console.log(err);
      })
    })
  })
}

function saveToFile(news){
  var fs = require('fs');
          fs.writeFile("test.html", news, function(err) {
              if(err) {
                  return console.log(err);
              }

              console.log("The file was saved!");
          });
}

function get_news_content_sign(site){
  var sign = "";
  switch(site){
    case news_list[0]:
      sign = ".main"; break;  //Zing.vn
    case news_list[1]:
      sign = ".article-content"; break; //Báo Lao Động
    case news_list[2]:
      sign = ".main-article"; break;  //Đài Tiếng Nói Việt Nam
    case news_list[3]:
      sign = ".ArticleDetail"; break;  //Vietnamnet.vn
    case news_list[4]:
      sign = ".listNewscm"; break;  //Báo Dân Việt
    case news_list[5]:
      sign = ".box-content"; break; //Bóng đá 24h
    case news_list[6]:
      sign = ".content"; break; //Bóng Đá +
    case news_list[7]:
      sign = "#content_detail"; break;  //Saostar
    case news_list[8]:
      sign = ".nwsHt"; break; //Tin tức 24h
    case news_list[9]:
      sign = ".col775"; break; //Thể Thao 247 (lời tuyên bố phát cho các báo)
    case news_list[10]:
      sign = ".cate-main-col"; break; //VTC News
    case news_list[11]:
      sign = ".kbw-content"; break; //Kênh 14
    /*case news_list[12]:
      sign = "#ctl00_IDContent_ctl00_divContent"; break; //Dân Trí*/
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
      sign = ".singer-entry img"; break; //Bóng đá 24h
    case news_list[6]:
      sign = ".content img"; break; //Bóng Đá +
    case news_list[7]:
      sign = "#content_detail img"; break;  //Saostar
    case news_list[8]:
      sign = ".nwsHt img"; break; //Tin tức 24h
    case news_list[9]:
      sign = ".share_image img"; break; //Thể Thao 247 (lời tuyên bố phát cho các báo)
    case news_list[10]:
      sign = "figure img"; break; //VTC News
    case news_list[11]:
      sign = ".VCSortableInPreviewMode img"; break; //Kênh 14
    /*case news_list[12]:
      sign = ".VCSortableInPreviewMode img"; break; //Dân Trí*/
  }
  return sign;
}

function get_new_removelist(site){
  var removeList = "";
  switch(site){
    case news_list[0]:
      removeList = zingnewsRemoveList; break;  //Zing.vn
    case news_list[1]:
      removeList = dummiRemoveList; break; //Báo Lao Động
    case news_list[2]:
      removeList = vovRemoveList; break;  //Đài Tiếng Nói Việt Nam
    case news_list[3]:
      removeList = vietnamnetRemoveList; break;  //Vietnamnet.vn
    case news_list[4]:
      removeList = danvietRemoveList; break;  //Báo Dân Việt
    case news_list[5]:
      removeList = bongda24hRemoveList; //Bóng đá 24h
    case news_list[6]:
      removeList = dummiRemoveList; //Bóng Đá +
    case news_list[7]:
      removeList = dummiRemoveList; break;  //Saostar
    case news_list[8]:
      removeList = tintuc24hRemoveList; break; //Tin tức 24h
    case news_list[9]:
      removeList = thethao247RemoveList; break; //Thể Thao 247 (lời tuyên bố phát cho các báo)
    case news_list[10]:
      removeList = vtcRemoveList; break; //VTC News
    case news_list[11]:
      removeList = kenh14RemoveList; break; //Kênh 14
    /*case news_list[12]:
      removeList = dantriRemoveList; break; //Dân Trí*/
  }
  return removeList;
}

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("tinnhanh bot listening at http://%s:%s", host, port)

});	