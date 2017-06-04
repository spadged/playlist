/// <reference path="refs/interfaces.ts" />

class XmlToJson
{
	private plist:any = require('plist');

	private base:string = "../../data/";

	constructor()
	{
		var folderList:Array<string> = Utils.readDir(this.base);

		for(var i = 0; i < folderList.length; i++)
		{
			var folderName:string = folderList[i];

			if(folderName != 'lookup.json' && folderName != 'manifest.json' && folderName != ".DS_Store")
			{
				var manifestItem:any = {year: folderName, files: []};
				
				var fileList:Array<string> = Utils.readDir(this.base + folderName + "/");

				for(var x=0; x < fileList.length; x++)
				{
					var fileName:string = fileList[x];
					
					if(fileName.indexOf('.xml') != -1)
					{
						manifestItem.files.push(fileName.replace(".xml",""));
						
						this.processFile(folderName, fileName);
					}
				}
			}
		}
	}

	private processFile(folder:string, name:string)
	{
		var path:string = folder + "/" + name;
		
		var playlist:IPlaylist = {
			name: name.split(" ")[1].replace(".xml",""),
			month: name.split(" ")[0],
			year: folder,
			id: Utils.generateUUID(),
			tracks: []
		}

		var rawData:string = Utils.openFile(this.base + path);

		var data:any = this.plist.parse(rawData);
		
		for(var key in data.Tracks)
		{
			var rawTrack:any = data.Tracks[key];

			var artist:string = rawTrack['Artist Artist'];

			if(artist == undefined || artist == "" || artist == "Various Artists")
			{
				artist = rawTrack['Artist'];
			}

			if(artist != undefined) artist = artist.trim();

			var trackName:string = rawTrack['Name'];
			var album:string = rawTrack['Album'];
			var length:number = <number> rawTrack['Total Time'];
			var year:string = rawTrack['Year'];
			var artistId:string = "";
			var albumId:string = "";
			
			var track:ITrack = {
				"album":{
					"name": album,
					"year": year,
					"id": albumId
				},
				"artists":[],
				"name": trackName,
				"id": Utils.generateUUID(),
				"length": length
			};

			track.artists.push({
				"name": artist,
				"id": artistId
			});

			playlist.tracks.push(track);
		}

		Utils.saveJsonFile(
			this.base + folder + "/" + playlist.name + ".json",
			playlist
		);
	}
}

class Utils
{
	private static fs:any = require("fs");
	
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
}

new XmlToJson();