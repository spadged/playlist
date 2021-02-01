const fs = require('fs-extra');

var dirPlaylist = '../../data/heads/';

var cacheArtist = {};

var cacheAlbum = {};

var cacheTrack = {};

function newPlaylist(head)
{
	let year = head.name.split(" ").pop();
	let month = head.name.split(" ").shift();
	
	let playlist = {
		id: head.id,
		name: head.name,
		year: year,
		month: {
			label: month,
			value: ""
		},
		images: head.images,
		tracks: []
	};

	return playlist;
}

function newTrack(data)
{
	let artists = [];

	data.artists.forEach((item)=>{

		let artist = newArtist(item);

		artists.push(artist);
	});

	let album = newAlbum(data.track.album);
	
	let track = {
		name: data.name,
		id: data.id,
		duration: data.duration_ms,
		explicit: data.explicit,
		added: data.added_at,
		popularity: data.popularity,
		external_id: {
			spotify: data.id,
			isrc: data.external_ids.isrc
		},
		artists: artists,
		album: album
	};

	return track;
}

function newAlbum(data)
{
	var result = data;

	delete result.available_markets;
	delete result.external_urls;
	delete result.href;
	delete result.uri;

	result.external_id = {
		spotify: data.id
	};

	return resultj;
}

function newArtist(data)
{
	let result = data;

	delete result.external_urls;
	delete result.href;
	delete result.uri;

	result.external_id = {
		spotify: data.id
	};

	return result;
}

function init()
{
	let heads = fs.readdirSync(dirPlaylist);

	heads.forEach((file) => {
		let head = fs.readJSONSync(dirPlaylist + file);

		head.items.forEach((item) => {
			let playlist = newPlaylist(item);

			let fileTracks = playlist.name.toLowerCase().split(" ").join("_");

			let rawTracks = fs.readFileSync('../../data/lists/' + playlist.date.year + '/' + fileTracks + '.json', 'utf-8').trim();

			///playlist.tracks = 

			//console.log(playlist);

			let tracks = JSON.parse(rawTracks);

			tracks.forEach((itemTrack)=>{
				
				let track = newTrack(itemTrack);

				playlist.tracks.push(track);
			});

			if(fileTracks === "octoer_top_5_2005")
			{
				console.log(playlist);
			}
		});
		
		
	});
}

init();