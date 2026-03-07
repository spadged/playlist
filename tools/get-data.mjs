import fs from 'fs-extra';
import itunes from 'itunes-data';

class GetMusicData {

    #KEY_PARENT_ID = "Parent Persistent ID";
    #KEY_ID = "Playlist Persistent ID";
    #KEY_ITEMS = "Playlist Items";
    #KEY_NAME = "Name";

    constructor()
    {
        console.log("getting data from local apple music");

        const stream = fs.createReadStream("../data-am/library.xml");

        const parser = itunes.parser();

        parser.on("library", (library) => {

            const SONGS = library.Tracks;

            const PL =  library.Playlists;

            const root = new Playlist(PL.find(element => element.Name === "Years"));

            const years = [];

            PL.forEach(list => {

                if(list[this.#KEY_PARENT_ID] == root.id)
                {
                    const playlist = new Playlist(list);

                    playlist.children = [];
                    
                    years.push(playlist);
                }
                
            });
            
            years.forEach(year => {

                console.log(year.name);

                const months = PL.filter( month => month["Parent Persistent ID"] === year.id);

                months.forEach(month => {
                    
                    const m = new Playlist(month);

                    m.tracks = [];

                    //normalise name

                    m.enTracken(SONGS);

                    year.addPlaylist(m);
                });
            });

           fs.writeJSONSync("../output/years.json", years, { spaces: "\t"});

        })

        stream.pipe(parser);
    }

}

class Playlist
{
    name;
    description;
    id;
    parent;

    children = null;
    tracks = null;

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
        console.log("-", this.name, "|", this.#playlist_items.length);
        
        this.#playlist_items.forEach(item => {

            const tid = item["Track ID"];

            const song = songs[tid];

            console.log("--", song["Name"], "|", song["Artist"]);

            if(song !== undefined)
            {
                this.tracks.push(song);
            }
        });
    }

    addPlaylist(list)
    {
        this.children.push(list);
    }
}

new GetMusicData();