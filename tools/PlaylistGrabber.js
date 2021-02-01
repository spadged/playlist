/// <reference path="refs/interfaces.ts" />
var PlaylistGrabber = /** @class */ (function () {
    function PlaylistGrabber() {
        this.SpotifyWebApi = require('spotify-web-api-node');
        var keys = Utils.openJsonFile("../keys.json");
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
    PlaylistGrabber.prototype.getCurrentUser = function () {
        var self = this;
        this.spotifyApi
            .getMe()
            .then(function (data) {
            console.log('Got Current User');
            console.log(data);
            self.getPlaylist(data.body.id);
        }, function (err) {
            console.log('Get current user error', err);
        });
    };
    PlaylistGrabber.prototype.getPlaylist = function (userId) {
        var self = this;
        this.spotifyApi
            .getUserPlaylists(userId, { limit: 50, offset: 50 })
            .then(function (data) {
            console.log('Got playlists');
            var playlists = data.body.items;
            for (var i = 0; i < playlists.length; i++) {
                var playlist = playlists[i];
                var name = playlist.name.toLowerCase();
                if (name.indexOf('top 5') != -1) {
                    var parts = name.split(" top 5 ");
                    var month = parts[0];
                    var year = parts[1];
                    /* this is really naughty - should use Q */
                    //console.log(playlist);
                    self.getPlaylistContent(userId, playlist, year, month);
                }
            }
        }, function (err) {
            console.log('Get User Playlist Error', err);
        });
    };
    PlaylistGrabber.prototype.getPlaylistContent = function (user, playlist, year, month) {
        var self = this;
        this.spotifyApi.getPlaylistTracks(user, playlist.id)
            .then(function (data) {
            console.log("Got playlist content");
            var items = data.body.items;
            var path = "../data/" + year + "/" + month + ".json";
            console.log("Playlist:", playlist.name);
            var outPlaylist = {
                name: playlist.name,
                month: { value: month, label: "" },
                year: year,
                id: playlist.id,
                tracks: []
            };
            for (var i = 0; i < items.length; i++) {
                var item = items[i].track;
                var outTrack = {
                    "album": {
                        "name": item.album.name,
                        "year": "",
                        "id": "",
                        "externalId": {
                            "spotify": item.album.id
                        }
                    },
                    "artists": [],
                    "name": item.name,
                    "id": "",
                    "length": item.duration_ms,
                    "externalId": {
                        "spotify": item.id
                    }
                };
                console.log("Track:", item.name);
                console.log("Album:", item.album.name);
                for (var z = 0; z < item.artists.length; z++) {
                    var outArtist = {
                        name: item.artists[z].name,
                        id: "",
                        externalId: {
                            spotify: item.artists[z].id
                        }
                    };
                    outTrack.artists.push(outArtist);
                }
                outPlaylist.tracks.push(outTrack);
            }
            if (!Utils.fileExists(path)) {
                Utils.saveJsonFile(path, outPlaylist);
            }
        }, function (err) {
            console.log('Get playlist content error', err);
        });
    };
    return PlaylistGrabber;
}());
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.readDir = function (path) {
        return this.fs.readdirSync(path);
    };
    Utils.openJsonFile = function (path) {
        return JSON.parse(this.openFile(path));
    };
    Utils.openFile = function (path) {
        return this.fs.readFileSync(path, "utf8");
    };
    Utils.saveJsonFile = function (path, data) {
        this.saveFile(path, JSON.stringify(data, null, '\t'));
    };
    Utils.saveFile = function (path, data) {
        this.fs.writeFileSync(path, data);
    };
    Utils.fileExists = function (path) {
        return this.fs.existsSync(path);
    };
    Utils.fs = require("fs");
    return Utils;
}());
new PlaylistGrabber();
