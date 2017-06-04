/// <reference path="refs/interfaces.ts" />

class GenerateLookup
{
	private generateManifest():void
	{

	}

	private generateLookup():void
	{
		var pathLookup:string = "../../data/cache/lookup-internal.json";
		
		var lookup:any = Utils.openJsonFile(pathLookup);

		this.iterateTracks(function(track:ITrack):void
		{
			//do stuff
		});

		Utils.saveJsonFile(pathLookup, lookup);
	}
	
	private generateInternal():void
	{
		var pathLookup:string = "../../data/cache/lookup-internal.json";
		
		var lookup:any = Utils.openJsonFile(pathLookup);
		
		this.iterateTracks(function(track:ITrack):void
		{
			var albumKey:string = Utils.nameToKey(track.album.name);

			if(track.album.id == "")
			{
				track.album.id = Utils.generateUUID();
			}

			if(lookup[track.album.name] === undefined)
			{
				lookup[albumKey] = track.album.id;
			}

			for(var i:number = 0; i < track.artists.length; i++)
			{
				var artist:IArtist = track.artists[i];

				var artistKey:string = Utils.nameToKey(artist.name);

				if(artist.id == "")
				{
					artist.id = Utils.generateUUID();
				}

				if(lookup[artistKey] === undefined)
				{
					lookup[artistKey] = artist.id;
				}
			}

			//todo, resave track data
		});

		Utils.saveJsonFile(pathLookup, lookup);
	}

	private iterateTracks(callback:Function):void
	{
		this.iteratePlaylists(function(playlist:IPlaylist, path:string)
		{
			for(var i:number = 0; i < playlist.tracks.length; i++)
			{
				var track:ITrack = playlist.tracks[i];
				
				callback(track)
			}
		})
	}

	private iteratePlaylists(callback:Function):void
	{
		var dirs:Array<string> = Utils.readDir("../../data/");

		for(var i:number=0; i < dirs.length; i++)
		{
			var dir:string = dirs[i];

			if(dir != "cache" && dir != ".DS_Store")
			{
				var files:Array<string> = Utils.readDir("../../data/" + dir + "/");

				for(var z:number = 0; z < files.length; z++)
				{
					var fileName:string = files[z];

					if(fileName != ".DS_Store")
					{
						var filePath:string = "../../data/" + dir + "/" + fileName;
						
						var playlist:IPlaylist = Utils.openJsonFile(filePath);

						callback(playlist, filePath);
					}
				}
			}
		}
	}
	
	constructor()
	{
		var dirs:Array<string> = Utils.readDir("../../data/");

		var manifest:Array<any> = [];

		var lookup:any = Utils.openJsonFile("../../data/lookup.json");

		var reset:boolean = true;

		if(reset)
		{
			lookup = {};
		}

		for(var i:number=0; i < dirs.length; i++)
		{
			var dir:string = dirs[i];

			if(dir != "lookup.json" && dir != "manifest.json" && dir != ".DS_Store")
			{
				var files:Array<string> = Utils.readDir("../../data/" + dir + "/");
				
				var list:Array<string> = [];

				for(var z:number = 0; z < files.length; z++)
				{
					var fileName:string = files[z];

					if(fileName != ".DS_Store")
					{
						list.push(fileName.replace(".json",""));
						
						var filePath:string = "../../data/" + dir + "/" + fileName;
						
						var playlist:IPlaylist = Utils.openJsonFile(filePath);

						for (var t:number = 0; t < playlist.tracks.length; t++)
						{
							var track:ITrack = playlist.tracks[t];

							if(playlist.tracks[t].id === "")
							{
								playlist.tracks[t].id = Utils.generateUUID();
							}

							var albumKey:string = Utils.nameToKey(track.album.name);

							if(lookup.albums[albumKey] === undefined)
							{
								var albumId:string = Utils.generateUUID();

								lookup.albums[albumKey] = {id: albumId, discogs: "", spotify: ""};

								playlist.tracks[t].album.id = albumId; 
							}

							if(track.album["externalId"] != undefined)
							{
								lookup.albums[albumKey].spotify = track.album.externalId.spotify;
							}

							for(var a:number=0; a < track.artists.length; a++)
							{
								var artist:IArtist = track.artists[a];

								var artistKey:string = Utils.nameToKey(artist.name);

								if(lookup.artists[artistKey] === undefined)
								{
									var artistId = Utils.generateUUID();

									lookup.artists[artistKey] = {id: artistId, discogs: "", spotify: ""};

									playlist.tracks[t].artists[a].id = artistId;
								}

								if(artist["externalId"] != undefined)
								{
									lookup.artists[artistKey].spotify = artist.externalId.spotify;
								}
							}
						}

						Utils.saveJsonFile(filePath, playlist);
					}
				}

				manifest.push({year: dir, files: list});
			}
		}

		Utils.saveJsonFile("../../data/lookup.json", lookup);

		Utils.saveJsonFile("../../data/manifest.json", manifest);
	}

	
}

class Utils
{
	private static fs:any = require("fs");

	public static nameToKey(name:string):string
	{
		return name.toLowerCase().trim().replace(/\s+/g, '');
	}
	
	public static generateUUID():string
	{
    	var d:number = new Date().getTime();

    	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
			/[xy]/g, 
			function(c):any
			{
				var r = (d + Math.random() * 16 ) % 16 | 0;
        
				d = Math.floor(d/16);

        		return (c == 'x' ? r : ( r&0x3 | 0x8) ).toString(16);
			}
		);

		return uuid;
	}

	public static readDir(path:String):Array<string>
	{
		return this.fs.readdirSync(path);
	}
	
	public static openJsonFile(path:string):any
	{
		console.log("opening: ", path);
		
		return JSON.parse(this.openFile(path));
	}

	private static openFile(path:string):string
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

new GenerateLookup();