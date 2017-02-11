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
				
				sb += "<h2><a href='#' class='item-year'>" + val.year + "</a></h2>";
				
				sb += "<ul>";
				
				$.each(val.months, function(key, val)
				{
					sb += "<li>";
					
					var month = val.number;
					
					sb += "<h3><a href='#' class='item-month'>" + val.month + "</a></h3>";
					
					sb += "<ul>";
					
					$.each(val.songs, function(key, val)
					{
						sb += "<li>";
						
						sb += "<a href='#' data-path='" + val.path + "' class='item-song'>" + val.name + "</a>";
						sb += "<span>" + val.artist + "</span>";
						sb += "</li>";
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
	
	var current_track;

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
		ready: function ()
		{
			//$("#jp_container .track-default").click();
		},
		timeupdate: function(event) {
			my_extraPlayInfo.text(parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%");
		},
		play: function(event)
		{
			my_playState.text(opt_text_playing);
		},
		pause: function(event)
		{
			my_playState.text(opt_text_selected);
		},
		ended: function(event)
		{
			my_playState.text(opt_text_selected);
			
			current_track = $("a", current_element.parent().next());
			
			current_track.click();
			
		},
		cssSelectorAncestor: "#jp_container",
		supplied: "mp3",
		swfPath:"lib/swf/Jplayer.swf"
	});
	
	var $date_info = $("#date-info");
	
	// Create click handlers for the different tracks
	$("#player-list a.item-song").click(function(e)
	{
		current_track = $(this);
		
		my_trackName.text(current_track.text());
		
		my_jPlayer.jPlayer(
			"setMedia",
			{
				mp3: current_track.attr("data-path")
			}
		);
		
		if((opt_play_first && first_track) || (opt_auto_play && !first_track))
		{
			my_jPlayer.jPlayer("play");
		}
		
		first_track = false;
		//get this items year
		var year = current_track.parent().parent().parent().parent().prev().text();
		
		//get this items month
		var month = current_track.parent().parent().prev().text();
		
		$date_info.text(month + " " + year);
		
		//current_track.blur();
		
		return false;
	});
	
	$("#btn-next").click(function(e)
	{
		current_track = $("a", current_track.parent().next());
		
		current_track.click();
		
		return false;
	});
	
	$("#btn-prev").click(function(e)
	{
		current_track = $("a", current_track.parent().prev());
		
		current_track.click();
		
		return false;
	});

	//$("#jplayer_inspector").jPlayerInspector({jPlayer:$("#jquery_jplayer")});
	
	init_tree();
}

function init_tree()
{
	$("a.item-year").click(function(e)
	{
		$(this).parent().next().toggle();
		
		return false;
	});
	
	$("a.item-month").click(function(e)
	{
		$(this).parent().next().toggle();
		
		
		return false;
	});
}