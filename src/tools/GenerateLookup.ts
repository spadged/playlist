/// <reference path="refs/interfaces.ts" />

class GenerateLookup
{
	constructor()
	{
		this.checkData();
		//this.generateManifest();
		//this.generateLookup();
	}

	private checkData():void
	{
		var months:any = {
			"january":1, "february":2, "march":3, "april":4,
			"may":5, "june":6, "july":7, "august":8,
			"september":9, "october":10, "november":11, "december":12
		};

		var pathLookup:string = "../../data/cache/lookup-internal.json";
		
		var lookup:any = Utils.openJsonFile(pathLookup);

		this.iteratePlaylists(function(playlist:IPlaylist, path:string):void
		{
			//check playlist month format is correct
			var month:string = playlist.name.split(" ")[0].toLowerCase();

			playlist.month = {
				label: month,
				value: months[month]
			};

			//check shit has a guid
			for(var i:number = 0; i < playlist.tracks.length; i++)
			{
				var track:ITrack = playlist.tracks[i];

				if(track.id == "")
				{
					playlist.tracks[i].id = this.generateUUID();
				}

				if(track.album.id == "")
				{
					var keyAlbum:string = Utils.nameToKey(track.album.name);

					if(lookup.album[keyAlbum] === undefined)
					{
						var albumId:string = Utils.generateUUID();
						
						playlist.tracks[i].album.id = lookup.album[keyAlbum] = albumId
					}
					else
					{
						playlist.tracks[i].album.id = lookup.album[keyAlbum];
					}
				}

				for(var z:number = 0; z < track.artists.length; z++)
				{
					var artist:IArtist = track.artists[z];

					console.log(artist);

					if(artist !== undefined && artist !== null && artist.id == "")
					{	
						var keyArtist:string = Utils.nameToKey(artist.name);
						
						if(lookup.artist[keyArtist] === undefined)
						{
							var artistId:string = Utils.generateUUID();

							playlist.tracks[i].artists[z].id = lookup.artist[keyArtist] = artistId;
						}
						else
						{
							playlist.tracks[i].artists[z].id = lookup.artist[keyArtist];
						}
					}
				}
			}

			Utils.saveJsonFile(path, playlist);
		});

		Utils.saveJsonFile(pathLookup, lookup);
	}

	private generateManifest():void
	{
		var path:string = "../../data/cache/manifest.json";
		
		var manifest:any = {};

		this.iteratePlaylists(function(playlist:IPlaylist):void
		{
			if(manifest[playlist.year] === undefined)
			{
				manifest[playlist.year] = [];
			}

			manifest[playlist.year].push(playlist.month);
		});

		Utils.saveJsonFile(path, manifest); 
	}
	
	private generateLookup():void
	{
		var self:any = this;
		
		var pathInternalLookup:string = "../../data/cache/lookup-internal.json";

		var pathLookup:string = "../../data/cache/lookup.json";

		var lookupInternal:any = {};

		var lookup:any = {};
		
		this.iterateTracks(function(playlist:IPlaylist, track:ITrack):void
		{
			var albumKey:string = Utils.nameToKey(track.album.name);

			if(lookupInternal.album[albumKey] === undefined)
			{
				lookupInternal.album[albumKey] = track.album.id;
			}

			if(lookup[track.album.id] == undefined)
			{
				lookup[track.album.id] = {
					spotify: self.getExternalId(track.album, "spotify"),
					discogs: self.getExternalId(track.album, "discogs"),
					type: "album"
				};
			}

			for(var i:number = 0; i < track.artists.length; i++)
			{
				var artist:IArtist = track.artists[i];

				var artistKey:string = Utils.nameToKey(artist.name);

				if(lookupInternal.artist[artistKey] === undefined)
				{
					lookupInternal.artist[artistKey] = artist.id;
				}

				if(lookup[artist.id] === undefined)
				{
					lookup[artist.id] = {
					spotify: self.getExternalId(track.album, "spotify"),
					discogs: self.getExternalId(track.album, "discogs"),
					type: "artist"
				};
				}
			}
		});

		Utils.saveJsonFile(pathLookup, lookup);

		Utils.saveJsonFile(pathInternalLookup, lookupInternal);
	}

	private getExternalId(data:any, property:string):string
	{
		var result:string = "";

		if(data['externalId'] !== undefined && data.externalId[property] !== undefined)
		{
			result = data.externalId[property];
		}

		return result;
	}

	private iterateTracks(callback:Function):void
	{
		this.iteratePlaylists(function(playlist:IPlaylist, path:string)
		{
			for(var i:number = 0; i < playlist.tracks.length; i++)
			{
				var track:ITrack = playlist.tracks[i];
				
				callback(playlist, track);
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
}

class Utils
{
	private static fs:any = require("fs");

	public static nameToKey(name:string):string
	{
		return name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '')
			.replace(/&/g,'and')
			.replace(/\./g,'');
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