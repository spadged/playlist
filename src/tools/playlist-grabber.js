var fs = require("fs");
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi;

function init() {
	var keys = JSON.parse(fs.readFileSync("keys.json", "utf8"));

	spotifyApi = new SpotifyWebApi({
		clientId: keys.ClientId,
		clientSecret: keys.ClientSecret,
		accessToken: keys.Token
	});

	getCurrentUser();

	/*spotifyApi.clientCredentialsGrant()
	.then(
		function (data)
		{
			console.log('The access token expires in ' + data.body['expires_in']);
			console.log('The access token is ' + data.body['access_token']);

			// Save the access token so that it's used in future calls
			spotifyApi.setAccessToken(data.body['access_token']);

			//getCurrentUser();
		},
		function (err)
		{
			console.log(err);
			
			//console.log('1 Something went wrong when retrieving an access token', err);
		}
	);*/
}
	

function getCurrentUser()
{
	spotifyApi
	.getMe()
	.then(
		function (data)
		{
			getPlaylist(data.body.id);
		},
		function (err)
		{
			console.log('Something went wrong!', err);
		}
	);
}

function getPlaylist(userId)
{
	spotifyApi
		.getUserPlaylists(userId, { limit: 50 })
		.then(
		function (data) {
			var playlists = data.body.items;

			for (var i = 0; i < playlists.length; i++) {
				var playlist = playlists[i];

				var name = playlist.name.toLowerCase();

				if (name.indexOf('top 5') != -1) {
					var parts = name.split(" top 5 ");
					var month = parts[0];
					var year = parts[1];

					/* this is really naughty - should use Q */

					getPlaylistContent(userId, playlist, year, month);
				}
			}
		},
		function (err)
		{
			console.log('Something went wrong!', err);
		}
	);
}

var lookup = {};

function getPlaylistContent(user, playlist, year, month)
{
	spotifyApi.getPlaylistTracks(user, playlist.id)
  	.then(function(data)
	  {
		var items = data.body.items;

		var path = "../data/" + year + "/" + month + ".json";
		
		var data = {
			name: playlist.name,
			month: month,
			year:year,
			id: playlist.id,
			tracks: []
		};

		for(var i = 0; i < items.length; i++)
		{
			var item = items[i].track;			

			var track = {
				"album":{
					"name": item.album.name,
					"image": item.album.images[0].url,
					"year": "",
					"id": item.album.id
				},
				"artist":[],
				"name": item.name,
				"id": item.id,
				"length": item.duration_ms
			};

			for(var z = 0; z < item.artists.length; z++)
			{
				var name = item.artists[z].name;
				var id = item.artists[z].id;
				
				track.artist.push({
					"name": name,
					"id": id
				});

				if(lookup[name] == undefined)
				{
					lookup[name] = {
						id: id,
						albums: {}
					}
				}

				lookup[name].albums[item.album.name] = item.album.id;
			}

			data.tracks.push(track);
		}

		fs.writeFileSync(path, JSON.stringify(data, null, '\t'));

		try{
			fs.writeFileSync("../data/lookup.json", JSON.stringify(lookup, null, '\t'));
		}
		catch(err)
		{
			console.log(err);
		}

		

  	}, function(err)
	  {
    	console.log('Something went wrong!', err);
  	});
}

init();