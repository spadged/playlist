$(function()
{
	$.getJSON(
		'data/json.php', 
		function(data)
		{
			var items = [];
			
			//this is a really dirty way to add this - do it properly
			var $container = $("#player-list");
			
			var sb = '';
			
			$.each(data, function(key, val)
			{
				var year = val.year;
				
				sb += "<div>";
				
				sb += "<h1><a href='#'>" + val.year + "</a></h1>";
				
				sb += "<ul>";
				
				$.each(val.months, function(key, val)
				{
					sb += "<li>";
					
					var month = val.number;
					
					sb += "<h2><a href='#'>" + val.month + "</a></h2>";
					
					sb += "<ul>";
					
					$.each(val.songs, function(key, val)
					{
						sb += "<li><a href='#' data-path='" + val.path + "'>" + val.name + " ~ " + val.artist + "</li></p>";
					});
					
					sb += "</ul>";
					
					sb += "</li>";
				});
				
				sb += "</ul>";
				
				sb += "</div>";
			});
			
			$container.append(sb);
			
			init_player();
		}
	);
});

function init_player()
{
	// Local copy of jQuery selectors, for performance.
	var	my_jPlayer = $("#jquery_jplayer"),
		my_trackName = $("#jp_container .track-name"),
		my_playState = $("#jp_container .play-state"),
		my_extraPlayInfo = $("#jp_container .extra-play-info");

	// Some options
	var	opt_play_first = false, // If true, will attempt to auto-play the default track on page loads. No effect on mobile devices, like iOS.
		opt_auto_play = true, // If true, when a track is selected, it will auto-play.
		opt_text_playing = "Now playing", // Text when playing
		opt_text_selected = "Track selected"; // Text when not playing

	// A flag to capture the first track
	var first_track = true;

	// Change the time format
	$.jPlayer.timeFormat.padMin = false;
	$.jPlayer.timeFormat.padSec = false;
	$.jPlayer.timeFormat.sepMin = " min ";
	$.jPlayer.timeFormat.sepSec = " sec";

	// Initialize the play state text
	my_playState.text(opt_text_selected);

	// Instance jPlayer
	my_jPlayer.jPlayer({
		ready: function () {
			$("#jp_container .track-default").click();
		},
		timeupdate: function(event) {
			my_extraPlayInfo.text(parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%");
		},
		play: function(event) {
			my_playState.text(opt_text_playing);
		},
		pause: function(event) {
			my_playState.text(opt_text_selected);
		},
		ended: function(event) {
			my_playState.text(opt_text_selected);
		},
		cssSelectorAncestor: "#jp_container",
		supplied: "mp3"
	});

	// Create click handlers for the different tracks
	$("#player-list a").click(function(e)
	{
		my_trackName.text($(this).text());
		
		my_jPlayer.jPlayer(
			"setMedia",
			{
				mp3: $(this).attr("data-path")
			}
		);
		
		if((opt_play_first && first_track) || (opt_auto_play && !first_track))
		{
			my_jPlayer.jPlayer("play");
		}
		
		first_track = false;
		
		$(this).blur();
		
		return false;
	});


	//$("#jplayer_inspector").jPlayerInspector({jPlayer:$("#jquery_jplayer")});
}