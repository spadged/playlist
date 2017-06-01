var fs = require("fs");
var plist = require('plist');

var lookup;

function init()
{
	var path = "../data/";

	lookup = JSON.parse(fs.readFileSync("../data/lookup.json", "utf8"));

	var folderList = fs.readdirSync(path);

	for(var i = 0; i < folderList.length; i++)
	{
		var folderName = folderList[i];
		
		if(folderName != 'lookup.json')
		{
			var fileList = fs.readdirSync(path + folderName + "/");

			for(var x=0; x < fileList.length; x++)
			{
				var fileName = fileList[x];
				
				if(fileName.indexOf('.xml') != -1)
				{
					processFile(path, folderName, fileName);
				}
			}
		}
	}
}

function processFile(base, folder, name)
{
	var path = base + folder + "/" + name;
	
	var playlist = {
		name: name.split(" ")[1].replace(".xml",""),
		month: name.split(" ")[0],
		year: folder,
		id: "",
		tracks: []
	}

	var rawData = fs.readFileSync(path, 'utf-8');

	var data = plist.parse(rawData);
	
	for(var key in data.Tracks)
	{
		var rawTrack = data.Tracks[key];

		var artist = rawTrack['Album Artist'];

		if(artist == undefined || artist == "")
		{
			artist = rawTrack['Artist'];
		}

		var trackName = rawTrack['Name'];
		var album = rawTrack['Album'];
		var length = rawTrack['Total Time'];
		var year = rawTrack['Year'];
		var artistId = "";
		var albumId = "";
		
		if(lookup[artist] != undefined)
		{
			artistId = lookup[artist].id;

			if(lookup[artist].album != undefined && lookup[artist].album[album] != undefined)
			{
				albumId = lookup[artist].album[album];
			}
		}
		
		var track = {
			"album":{
				"name": album,
				"image": "",
				"year": year,
				"id": albumId
			},
			"artist":[],
			"name": trackName,
			"id": "",
			"length": length
		};

		track.artist.push({
			"name": artist,
			"id": artistId
		});

		playlist.tracks.push(track);
	}

	fs.writeFileSync(
		base + folder + "/" + playlist.name + ".json", 
		JSON.stringify(playlist, null, '\t')
	);
}

init();