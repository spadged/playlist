declare var require:any;

interface IPlaylist
{
	tracks:Array<ITrack>;
	name:string;
	year:string;
	month:IValueLabel;
	id:string;
}

interface IAlbum
{
	name:string;
	year:string;
	id:string;
	externalId?:IExternalId;
}

interface ITrack
{
	album:IAlbum;
	name:string;
	artists:Array<IArtist>
	id:string;
	length:number;
	externalId?:IExternalId;
}

interface IArtist
{
	name:string;
	id:string;
	externalId?:IExternalId;
}

interface IExternalId
{
	spotify?:string;
	gracenote?:string;
	discogs?:string;
}

interface IValueLabel
{
	value:string;
	label:string;
}