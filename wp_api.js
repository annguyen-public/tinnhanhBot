var WPAPI = require( 'wpapi' );
var ultils = require("./utils.js");

var site = new WPAPI({
  endpoint: 'http://p8mg0r-user.freehosting.host/wp-json/',
  username: 'admin',
  password: '123'
});

exports.postToWP = function (data) {
	site.posts().create({
	  title: data.title,
	  content: data.content,
	  categories: data.categories,
	  status: 'publish'
	}).then(function( post ) {
	  // Create the media record & upload your image file
	  ultils.download(data.featured_media, post.id + '.jpg', function(){
		  //var filePath = data.featured_media;
		  return site.media().file( post.id + '.jpg' ).create({
		    title: 'Featured image news: ' + post.id,
		    post: post.id
		  }).then(function( media ) {
		  	ultils.delete_file(post.id + '.jpg');
		  	//console.log(media);
		    // Set the new media record as the post's featured media
		    return site.posts().id( post.id ).update({
		      featured_media: media.id
		    }).then(function( response ) {
    			//console.log( response );
			});		  	
		  });
		});	  
	});
}

exports.postNoFeature = function(data){
	site.posts().create({
	    // "title" and "content" are the only required properties
	    title: data.title,
	    content: data.content,
	  	categories: data.categories,
	    // Post will be created as a draft by default if a specific "status"
	    // is not specified
	    status: 'publish'
	}).then(function( response ) {
	    // "response" will hold all properties of your newly-created post,
	    // including the unique `id` the post was assigned on creation
	    console.log( response );
	})
}

exports.test = function(){
	site.posts().create({
	    // "title" and "content" are the only required properties
	    title: "test",
	    content: "test"
	}).then(function( response ) {
	    // "response" will hold all properties of your newly-created post,
	    // including the unique `id` the post was assigned on creation
	    console.log( response );
	})
}