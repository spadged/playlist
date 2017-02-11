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

function getPlaylistContent(user, playlist, year, month)
{
	spotifyApi.getPlaylistTracks(user, playlist.id)
  	.then(function(data)
	  {
    	console.log('The playlist contains these tracks', data.body);

		var items = data.body.items;

		var path = "../data/" + year + "/" + month + ".json";
		
		data = [];

		for(var i = 0; i < items.length; i++)
		{
			var item = items[i].track;

			data.push({
				"album": item.album.name,
				"name": item.name,
				"artist": item.artists[0].name,
				"image": item.album.images[0].url
			});
		}

		fs.writeFileSync(path, JSON.stringify(data, null, '\t'));

  	}, function(err)
	  {
    	console.log('Something went wrong!', err);
  	});
}

init();