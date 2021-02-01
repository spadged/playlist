/// <reference path="refs/interfaces.ts" />

class DataFill
{
	private index:number = 0;

	private db:any;
	
	constructor()
	{
		var Discogs:any = require('disconnect').Client;

		var keys:any = Utils.openJsonFile("../keys.json");

		var dis = new Discogs({
			consumerKey: keys.discogs.ClientId, 
			consumerSecret: keys.discogs.ClientSecret
		});

		this.db = dis.database();

		var self:any = this;

		this.db.search("Behind The Scenes", {type:"master", artist: "DJ Format"})
			.then(
				function(data):void
				{ 
					//console.log(data.results[0]);

					return self.db.getMaster(data.results[0].id);
				}
			).then(
				function(data):void
				{
					console.log(data);
				}
			)
	}

	private getDetails():void
	{
		var track:ITrack;
		
		var albumName = track.album.name;

		var albumArtist = track.artists[0].name;
		
		this.db.search(track.name, {type:"master", artist: albumArtist})
			.then(
				function(data):void
				{ 
					//console.log(data.results[0]);

					return this.db.getMaster(data.results[0].id);
				}
			).then(
				function(data):void
				{
					console.log(data);
				}
			)
	}
}

class Utils
{
	private static fs:any = require("fs");
	
	public static nameToKey(name:string):string
	{
		var result:string = name.toLowerCase();

		result = result.replace(/\s+/g, '');

		return result;
	}

	public static openJsonFile(path:string):any
	{
		return JSON.parse(this.openFile(path));
	}

	public static openFile(path:string):string
	{
		return this.fs.readFileSync(path, "utf8");
	}
}

new DataFill();