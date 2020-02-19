/// <reference path="refs/interfaces.ts" />

class PlaylistGrabber
{
	private SpotifyWebApi:any = require('spotify-web-api-node');
	private spotifyApi:any;

	constructor()
	{
		var keys:any = Utils.openJsonFile("../../keys.json");

		this.spotifyApi = new this.SpotifyWebApi({
			clientId: keys.ClientId,
			clientSecret: keys.ClientSecret,
			accessToken: keys.Token
		});

		this.getCurrentUser();

		/*this.spotifyApi.clientCredentialsGrant()
		.then(
			(data) =>
			{
				console.log('The access token expires in ' + data.body['expires_in']);
				console.log('The access token is ' + data.body['access_token']);

				// Save the access token so that it's used in future calls
				this.spotifyApi.setAccessToken(data.body['access_token']);

				this.getCurrentUser();
			},
			function (err)
			{
				console.log(err);
				
				//console.log('1 Something went wrong when retrieving an access token', err);
			}
		);*/
	}
		
	private getCurrentUser()
	{
		var self:any = this;
		
		this.spotifyApi
		.getMe()
		.then(
			function (data)
			{
				console.log('Got Current User');

				console.log(data);

				//self.getPlaylist(data.body.id);
			},
			function (err)
			{
				console.log('Get current user error', err);
			}
		);
	}

	private getPlaylist(userId):void
	{
		var self:any = this;
		
		this.spotifyApi
			.getUserPlaylists(userId, { limit: 50, offset: 50 })
			.then(
			function (data) 
			{
				console.log('Got playlists');
				
				var playlists = data.body.items;

				for (var i = 0; i < playlists.length; i++)
				{
					var playlist = playlists[i];

					var name = playlist.name.toLowerCase();

					if (name.indexOf('top 5') != -1)
					{
						var parts = name.split(" top 5 ");
						var month = parts[0];
						var year = parts[1];

						/* this is really naughty - should use Q */

						//console.log(playlist);

						self.getPlaylistContent(userId, playlist, year, month);
					}
				}
			},
			function (err)
			{
				console.log('Get User Playlist Error', err);
			}
		);
	}

	private getPlaylistContent(user:string, playlist:any, year:string, month:string):void
	{
		var self = this;
		
		this.spotifyApi.getPlaylistTracks(user, playlist.id)
		.then(function(data)
		{
			console.log("Got playlist content");
			
			var items:Array<any> = data.body.items;

			var path = "../../data/" + year + "/" + month + ".json";
			
			console.log("Playlist:", playlist.name)

			var outPlaylist:IPlaylist = {
				name: playlist.name,
				month: {value: month, label: ""},
				year:year,
				id: playlist.id,
				tracks: []
			};

			for(var i:number = 0; i < items.length; i++)
			{
				var item:any = items[i].track;			

				var outTrack:ITrack = {
					"album":{
						"name": item.album.name,
						"year": "",
						"id": "",
						"externalId":{
							"spotify": item.album.id,
						}
					},
					"artists":[],
					"name": item.name,
					"id": "",
					"length": item.duration_ms,
					"externalId":{
						"spotify": item.id
					}
				};

				console.log("Track:", item.name)

				console.log("Album:", item.album.name)

				for(var z = 0; z < item.artists.length; z++)
				{					
					var outArtist:IArtist = {
						name: item.artists[z].name,
						id: "",
						externalId: {
							spotify: item.artists[z].id
						}
					}

					outTrack.artists.push(outArtist);
				}

				outPlaylist.tracks.push(outTrack);
			}

			if(!Utils.fileExists(path))
			{
				Utils.saveJsonFile(path, outPlaylist);
			}
		}, 
		function(err)
		{
			console.log('Get playlist content error', err);
		});
	}
}

class Utils
{
	private static fs:any = require("fs");

	public static readDir(path:String):Array<string>
	{
		return this.fs.readdirSync(path);
	}
	
	public static openJsonFile(path:string):any
	{
		return JSON.parse(this.openFile(path));
	}

	public static openFile(path:string):string
	{
		return this.fs.readFileSync(path, "utf8");
	}

	public static saveJsonFile(path:string, data:any):void
	{
		this.saveFile(path, JSON.stringify(data, null, '\t'));
	}

	private static saveFile(path:string, data:string):void
	{
		this.fs.writeFileSync(path, data);
	}

	public static fileExists(path:string):boolean
	{
		return this.fs.existsSync(path);
	}
}

new PlaylistGrabber();