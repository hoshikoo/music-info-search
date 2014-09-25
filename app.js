$(document).ready(function(){

	$('.artistSubmit').submit( function(event){
		var artistName = $(this).find("input[name='artistName']").val();
		$(".artist-name").html('');
		event.preventDefault();
		var artistNameTag = artistName.toLowerCase().split(' ').join('+');
		getResult(artistNameTag);
		document.getElementById("inputform").value = "";
		$(".error").remove();
	});

	 $(document).keypress(function(e){  
    	if(e.which == 13){     
	   		e.preventDefault();
	   		$('.artistSubmit').submit ();
	   };
    }); 


	getResult("marvin+gaye");

	$(".similarArtistspic").click(function(event){
		event.preventDefault();
		var findArtistName = $(this).find(".simiNames")
		var artistName = $(findArtistName).text();
		var artistNameTag = artistName.toLowerCase().split(' ').join('+');
		getResult(artistNameTag);
	});

	$('.simi').flexslider({
    animation: "slide",
    animationLoop: false,
    itemWidth: 150,
    itemMargin: 5
  	});

  	 $('.pictures').flexslider({
    animation: "slide",
    controlNav: "thumbnails",
    itemWidth: 250,
  	});

  	$('#audio-player').mediaelementplayer({
            alwaysShowControls: true,
            features: ['playpause','volume','progress'],
            audioVolume: 'horizontal',
            audioWidth: 200,
            audioHeight: 100
    });
});



var showError = function(error){
	var errorElem = $('.error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};



var getResult = function(artistNameTag){
	var echonestApi = "http://developer.echonest.com/api/v4/artist/";
	var echonestkey = "?api_key=HDRBCYY9TLSIFUMSR&"

	$.getJSON(echonestApi+"search"+echonestkey+"format=json&name="+artistNameTag+"&results=1").done(function(data) { 
		var responseData = data.response;
		if(responseData["artists"][0] === undefined) {
			$( "#basicModal" ).dialog({
		        modal: true,
		        height: 400,
		        title: "Something went wrong...",
		        width: 400,
		    });
		
	}else{
		$(".artist-name").text(responseData["artists"][0]["name"]);
	}
	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.artist-name').append(errorElem);
	});

	$.getJSON(echonestApi+"biographies"+echonestkey+"name="+artistNameTag+"&format=json&results=1&start=0&license=cc-by-sa").done(function(data) { 
		var responseData = data.response;
		$(".bio").html('');
		$(".bio").text("Bio: " + responseData["biographies"][0]["text"]);
			var artistName = artistNameTag.replace("+"," ");
		$('.bio').highlight(artistName);
	}).fail(function(jqXHR, error, errorThrown){
	var errorElem = showError(error);
	$('.bio').append(errorElem);	    
	});

	$.getJSON(echonestApi+"images"+echonestkey+"name="+artistNameTag+"&format=json&results=5&start=0&license=unknown").done(function(data) { 
		$(".pics").removeAttr("src");

		var responseData = data.response;
		var picsNumLength = responseData.images.length;
		var picsImg = responseData.images;		
		for (var i = 0; i<5; i++){
			$( ".pics" ).each(function(i) {		
				if(picsImg[i]=== undefined){
		        	$(this).attr("src", "images/photo_not_available_big.jpg");
		    	}else{
		    		$(this).attr("src", picsImg[i]["url"]);
		    	};		    	
			});
		};
	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.pictures').append(errorElem);
	});

	$.getJSON(echonestApi+"search"+echonestkey+"&format=json&name="+artistNameTag+"&results=1&bucket=id:spotify").done(function(data) { 
		$(".top5ongs").html("");
		$(".top5ongs").append("<p>Top 5 Songs</>");

		var responseData = data.response;
		var spotifyid=responseData["artists"][0]["foreign_ids"][0]["foreign_id"]; 	
		var spotifyidtouse = spotifyid.replace("spotify:artist:","");

		$.getJSON("https://api.spotify.com/v1/artists/"+spotifyidtouse+"/top-tracks?country=US").done(function(data){
			for (var i = 0; i <= 4; i++){
			   $("<div class='audio-player'><h1 class='songtitle'></h1><img class='cover' alt=''><audio class='player' type='audio/mp3' controls='controls'></audio><div class='spotfylink'><a class='spotifyopen' target='_blank'><img class='spotifylogo' src='images/listen-blue.png'/></a></div></div>").appendTo(".top5ongs");				
				$( ".audio-player" ).each(function(i) {
						$( this ).find(".songtitle").text(data["tracks"][i]["name"]);		
				    	$( this ).find(".cover").attr("src", data["tracks"][i]["album"]["images"][1]["url"]);
				    	$( this ).find(".player").attr("src", data["tracks"][i]["preview_url"]);
				    	$( this ).find(".spotfylink a").attr("href", data["tracks"][i]["external_urls"]["spotify"]);
				});	
			};		
		});
	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.top5ongs').append(errorElem);
	});


	$.getJSON(echonestApi+"terms"+echonestkey+"name="+artistNameTag+"&format=json").done(function(data) { 
		$(".genre").html('');
		var responseData = data.response;
		var genreresponse = "Genre: " + responseData["terms"][0]["name"] + ", "+ responseData["terms"][1]["name"]+ ", "+ responseData["terms"][2]["name"];
		
		$(".genre").text(genreresponse.toTitleCase()); 
	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.genre').append(errorElem);
	});
	

	$.getJSON(echonestApi+"news"+echonestkey+"name="+artistNameTag+"&format=json&results=1&start=0").done(function(data) { 
		var responseData = data.response;
		$(".url a").removeAttr("href");
		$(".title").html('');
		$(".url a").html('');
		$(".summary").html('');
		$(".title").text("Related News: "+responseData["news"][0]["name"]); 
		$(".url a").attr("href", responseData["news"][0]["url"]); 
		$(".url a").text("Link: "+responseData["news"][0]["url"]); 
		$(".summary").html("Summsry: "+ responseData["news"][0]["summary"]); 
	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.title').append(errorElem);
	});

	$.getJSON(echonestApi+"urls"+echonestkey+"name="+artistNameTag+"&format=json").done(function(data) { 
		$(".officialsite a").removeAttr("href");
		$(".officialsite a").html('');
		var responseData = data.response;
		// var officiallinkcheck = $.inArray("official_url", responseData["urls"]);
		// console.log(responseData["urls"]);
		// console.log(officiallinkcheck);
		// if(officiallinkcheck === -1){
		// 	$(".officialsite a").text("Sorry No Official Website is available");
		// }else{
			$(".officialsite a").attr("href", responseData["urls"]["official_url"]); 
			$(".officialsite a").text(responseData["urls"]["official_url"]); 		
	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.officialsite a').append(errorElem);	
	});

	$.getJSON(echonestApi+"search"+echonestkey+"format=json&results=1&name="+artistNameTag+"&bucket=id:whosampled").done(function(data) { 
		$(".whosampleda").removeAttr("href");
		var responseData = data.response;
		var foreignids=responseData["artists"][0];
		if(responseData["artists"][0]["foreign_ids"]===undefined){
			$(".whosampled").css("display","none");
		}else{
			$(".whosampled").css("display","block");
			var whosampledid=responseData["artists"][0]["foreign_ids"][0]["foreign_id"]; 
			var whosampledArtistid = whosampledid.match(/\d+$/)[0];
			$(".whosampleda").attr("href", "http://www.whosampled.com/artist/view/"+whosampledArtistid);
		}
	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.whosampled').append(errorElem);			   			
	});
	

	$.getJSON(echonestApi+"similar"+echonestkey+"name="+artistNameTag+"&format=json&results=5&start=0").done(function(data) { 
		$(".simipics").removeAttr("src");
		$(".simiNames").html('');
		var responseData = data.response;

		for (var i = 0; i<5; i++){
			$(".simiNames").each(function(i){
				$(this).text(responseData["artists"][i]["name"]); 
			});
		};

		var similarid = responseData["artists"][0]["id"];
		$.getJSON(echonestApi+"images"+echonestkey+"id="+similarid+"&format=json&results=1&start=0&license=unknown").done(function(data) { 
			var responseData = data.response;
			if(responseData.images[0]=== undefined){
			    $(".simipics1").attr("src", "images/photo_not_available_big.jpg");
			}else{
				$(".simipics1").attr("src", responseData["images"][0]["url"]); 
			};
		}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.simipics1').append(errorElem);		
		});

		var similarid = responseData["artists"][1]["id"];
		$.getJSON(echonestApi+"images"+echonestkey+"id="+similarid+"&format=json&results=1&start=0&license=unknown").done(function(data) { 
			var responseData = data.response;
			if(responseData.images[0]=== undefined){
			    $(".simipics2").attr("src", "images/photo_not_available_big.jpg");
			}else{
				$(".simipics2").attr("src", responseData["images"][0]["url"]); 
			};
		}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.simipics2').append(errorElem);		
		});
		
		var similarid = responseData["artists"][2]["id"];
		$.getJSON(echonestApi+"images"+echonestkey+"id="+similarid+"&format=json&results=1&start=0&license=unknown").done(function(data) { 
			var responseData = data.response;
			if(responseData.images[0]=== undefined){
			    $(".simipics3").attr("src", "images/photo_not_available_big.jpg");
			}else{
				$(".simipics3").attr("src", responseData["images"][0]["url"]); 
			};
		}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.simipics3').append(errorElem);		
		});

		var similarid = responseData["artists"][3]["id"];
		$.getJSON(echonestApi+"images"+echonestkey+"id="+similarid+"&format=json&results=1&start=0&license=unknown").done(function(data) { 
			var responseData = data.response;
			if(responseData.images[0]=== undefined){
			    $(".simipics4").attr("src", "images/photo_not_available_big.jpg");
			}else{
				$(".simipics4").attr("src", responseData["images"][0]["url"]); 
			};
		}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.simipics4').append(errorElem);		
		});

		var similarid = responseData["artists"][4]["id"];
		$.getJSON(echonestApi+"images"+echonestkey+"id="+similarid+"&format=json&results=1&start=0&license=unknown").done(function(data) { 
			var responseData = data.response;
			if(responseData.images[0]=== undefined){
			    $(".simipics5").attr("src", "images/photo_not_available_big.jpg");
			}else{
				$(".simipics5").attr("src", responseData["images"][0]["url"]); 
			};
		}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.simipics5').append(errorElem);		
		});

	}).fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.simiNames').append(errorElem);		
	});

};
		
		// for (var i = 0; i<5; i++){
		// 	var similarid = responseData["artists"][i]["id"];
		// 	function getResults(i, similarid) {
		// 		$.getJSON(echonestApi+"images"+echonestkey+"id="+similarid+"&format=json&results=1&start=0&license=unknown").done(function(data) { 
		// 			var responseData = data.response;

		// 			console.log(responseData["images"][0]);		
		// 			var j = 0;	
		// 			$( ".simipics").each(function() {
		// 				if(i==j){
		// 					if(responseData.images[0]=== undefined){
		// 					    $(".simipics").attr("src", "images/photo_not_available_big.jpg");
		// 					}else{
		// 					    $(".simipics").attr("src", responseData["images"][0]["url"]);
		// 					};	
		// 				}
		// 				j++;		
		// 			});	    	
		// 		});
		// 	};
		// 	getResults(i, similarid);
		// };
