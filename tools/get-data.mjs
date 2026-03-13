import fs from 'fs-extra';
import itunes from 'itunes-data';
import chalk from 'chalk';

class GetMusicData {

    #KEY_PARENT_ID = "Parent Persistent ID";
    #KEY_ID = "Playlist Persistent ID";
    #KEY_ITEMS = "Playlist Items";
    #KEY_NAME = "Name";

    constructor()
    {
        console.log("getting data from local apple music");

        const stream = fs.createReadStream("../sources/apple-music/library.xml");

        const parser = itunes.parser();

        parser.on("library", (library) => {

            console.log("onLibrary");

            const SONGS = library.Tracks;

            //console.log(SONGS);

            const PL = library.Playlists;

            //console.log(PL);

            const zoot = PL.find(element => element.Name === "Years");

            console.log(zoot);

            const root = new Playlist(zoot);

            console.log(root);

            const years = [];

            PL.forEach(list => {

                if(list[this.#KEY_PARENT_ID] == root.id)
                {
                    const playlist = new Playlist(list);

                    playlist.children = [];
                    
                    years.push(playlist);
                }
                
            });

            console.log(years.length);

            const missing = {};
            
            years.forEach(year => {

                console.log(year.name);

                const months = PL.filter( month => month["Parent Persistent ID"] === year.id);

                months.forEach(month => {
                    
                    const m = new Playlist(month);

                    m.year = parseInt(year.name);

                    m.name = this.fixPlaylistTitle(m.name);

                    m.tracks = [];

                    //normalise name

                    m.enTracken(SONGS);

                    if(m.tracks.length != 5 && m.tracks.length != 10 && m.tracks.length != 0)
                    {
                        missing[m.name] = [];

                        let fillcount = 0;

                        if(m.tracks.length < 5)
                        {
                            fillcount = 5;
                        }

                        if(m.tracks.length > 5)
                        {
                            fillcount = 10;
                        }

                        fillcount = fillcount - m.tracks.length;

                        for(var i =0; i < fillcount; i++)
                        {
                            missing[m.name].push(Track.empty());
                        }
                    }

                    year.addPlaylist(m);
                });
            });

            //fs.writeJSONSync("../sources/fixes/index.json", missing, { spaces: "\t" })

           fs.writeJSONSync("../output/years.json", years, { spaces: "\t"});

        })

        stream.pipe(parser);
    }

    fixPlaylistTitle(value)
    {
        let result = value.toLowerCase().replace("top 5", "");

        try{
            result = this.fixy(result, "dec" , "12");
            result = this.fixy(result, "nov" , "11");
            result = this.fixy(result, "oct" , "10");
            result = this.fixy(result, "sep" , "09");
            result = this.fixy(result, "aug" , "08");
            result = this.fixy(result, "jul" , "07");
            result = this.fixy(result, "jun" , "06");
            result = this.fixy(result, "may" , "05");
            result = this.fixy(result, "apr" , "04");
            result = this.fixy(result, "mar" , "03");
            result = this.fixy(result, "feb" , "02");
            result = this.fixy(result, "jan" , "01");
        }
        catch(error)
        {
            console.error(error);
        }

        result = result.trim();

        return result;
    }

    fixy(value, label, seq)
    {
        if(value.indexOf(label) !== -1) 
        {
            let parts = value.split(" ");

            value = `${seq}-${parts.pop()}`;
        }

        return value;
    }
}

class Playlist
{
    name;
    description;
    id;
    parent;

    month;
    year;

    children;
    tracks;

    #KEY_PARENT_ID = "Parent Persistent ID";
    #KEY_ID = "Playlist Persistent ID";
    #KEY_ITEMS = "Playlist Items";
    #KEY_NAME = "Name";

    #playlist_items = [];
    
    constructor(playlist)
    {
        this.name = playlist[this.#KEY_NAME];
        this.description = playlist.Description;
        this.id = playlist[this.#KEY_ID];

        if(playlist[this.#KEY_ITEMS] !== undefined)
        {
            this.#playlist_items = playlist[this.#KEY_ITEMS];
        }

        if(playlist[this.#KEY_PARENT_ID] !== undefined)
        {
            this.parent = playlist[this.#KEY_PARENT_ID];
        }
    }

    enTracken(songs)
    {
        
        let listLength = this.#playlist_items.length;

        let listCount = (listLength != 5 && listLength != 10) ? chalk.red(listLength) : chalk.green(listLength);
        
        console.log("-", this.name, "|", listCount);
        
        this.#playlist_items.forEach(item => {

            const tid = item["Track ID"];

            const song = songs[tid];

            //console.log("--", song["Name"], "|", song["Artist"]);

            if(song !== undefined)
            {
                this.tracks.push(new Track(song));
            }
        });
    }

    addPlaylist(list)
    {
        this.children.push(list);
    }
}

class Track 
{
    trackId;
    name;
    artist;
    albumArtist;
    composer = [];
    album;
    genre;
    kind;
    size;
    totalTime;
    discNumber;
    discCount;
    trackNumber;
    trackCount;
    year;
    dateModified;
    bitRate;
    sampleRate;
    releaseDate;
    artworkCount;
    sortAlbum;
    sortArtist;
    sortName;
    persistentId;
    trackType;
    appleMusic;
    playlistOnly;

    constructor(track)
    {
        this.trackId = track["Track ID"];
        this.name = track["Name"];
        this.artist = track["Artist"];
        this.albumArtist = track["Album Artist"];

        let comp = track["Composer"];

        if(comp !== undefined)
        {
            if(comp.indexOf(", ") != -1)
            {
                this.composer = comp.split(", ");
            }
            else
            {
                this.composer = [comp];
            }
        }

        this.album = track["Album"];
        this.genre = track["Genre"];
        this.kind = track["Kind"];
        this.size = track["Size"];
        this.totalTime = track["Total Time"];
        this.discNumber = track["Disc Number"];
        this.discCount = track["disc count"];
        this.trackNumber = track["Track Number"];
        this.trackCount = track["Track Count"];
        this.year = track["Year"];
        this.dateModified = track["Date Modified"];
        this.bitRate = track["Bit Rate"];
        this.sampleRate = track["Sample Rate"];
        this.releaseDate = track["Release Date"];
        this.artworkCount = track["Artwork Count"];
        this.sortAlbum = track["Sort Album"];
        this.sortArtist = track["Sort Artist"];
        this.sortName = track["Sort Name"];
        this.persistentId = track["Persistent ID"];
        this.trackType = track["Track Type"];
        this.appleMusic = track["Apple Music"];
        this.playlistOnly = track["Playlist Only"];
    }

    static empty()
    {
        return new Track({
			"Track ID": 0,
			"Name": "",
			"Artist": "",
			"Album Artist": "",
			"Composer": "",
			"Album": "",
			"Genre": "",
			"Kind": "",
			"Size": 0,
			"Total Time": 0,
			"Disc Number": 0,
			"Disc Count": 0,
			"Track Number": 0,
			"Track Count": 0,
			"Year": 1900,
			"Date Modified": "",
			"Date Added": "",
			"Bit Rate": 0,
			"Sample Rate": 0,
			"Release Date": "",
			"Artwork Count": 0,
			"Sort Album": "",
			"Sort Artist": "",
			"Sort Name": "",
			"Persistent ID": "",
			"Track Type": "",
			"Purchased": ""
		});
    }
}

new GetMusicData();