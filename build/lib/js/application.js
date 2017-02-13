$(function()
{
	$.getJSON(
		'data/json.php', 
		function(data)
		{
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
					
					sb += "<h3><a href='#' class='item-month' title='" + val.month + ' ' + year + "'>" + val.month + "</a></h3>";
					
					sb += "<ul>";
					
					$.each(val.songs, function(key, val)
					{
						var img_path = (val.img == false) ? "http://placekitten.com/g/200/200" : val.img;
						
						sb += "<li>";
						sb += "<a href='#' data-path='" + val.path + "' class='item-song'>";
						sb += "<img src='" + img_path + "'/>";
						sb += "<span>";
						sb += "<big>" + val.name + "</big>";
						sb += "<small>" + val.artist + "</small>";
						sb += "</span>";
						sb += "</a>";
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
	var	my_jPlayer = $("#jquery_jplayer");
	var	my_trackName = $("#jp_container .track-name");
	var	my_playState = $("#jp_container .play-state");
	var	my_extraPlayInfo = $("#jp_container .extra-play-info");
	
	var $date_info = $("#date-info");
	
	var $btn_next = $("#btn-next");
	var $btn_prev = $("#btn-prev");
	
	var current_track;

	// Some options
	var	opt_play_first = false;
	var	opt_auto_play = true; 
	var	opt_text_playing = "Now playing";
	var	opt_text_selected = "Track selected"; 

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
		timeupdate: function(event)
		{
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
			$btn_next.click();
		},
		cssSelectorAncestor: "#jp_container",
		supplied: "mp3",
		swfPath:"lib/swf/Jplayer.swf"
	});
	
	// Create click handlers for the different tracks
	$("#player-list a.item-song").click(function(e)
	{
		current_track = $(this);
		
		my_trackName.text(current_track.text());
		
		$("#player-list .current").removeClass("current");
		
		current_track.addClass("current");
		
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
	
	$btn_next.click(function(e)
	{
		current_track = $("a", current_track.parent().next());
		
		current_track.click();
		
		return false;
	});
	
	$btn_prev.click(function(e)
	{
		current_track = $("a", current_track.parent().prev());
		
		current_track.click();
		
		return false;
	});

	$("a.item-year").click(function(e)
	{
		$(this).parent().next().slideToggle();
		
		return false;
	});
	
	$("a.item-month").click(function(e)
	{
		$(this).parent().next().slideToggle();
		
		return false;
	});
}