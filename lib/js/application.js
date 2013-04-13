$(function()
{
	$.getJSON(
		'data/json.php', 
		function(data)
		{
			var items = [];
			
			var $body = $("body");
			
			//this is a really dirty way to add this - do it properly
			
			$.each(data, function(key, val)
			{
				$body.append("<h1>" + val.year + "</h1>");
				
				$.each(val.months, function(key, val)
				{
					$body.append("<h2>" + val.month + "</h2>");
					
					$.each(val.songs, function(key, val)
					{
						$body.append("<p> " + val.artist + " ~ " + val.name + "</p>");
					});
					
				});
			});
		}
	);
});