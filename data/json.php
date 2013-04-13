<?
	//includes
	include "xml_parser.php";
	
	//get list of year folders
	$years = get_directory_list("./");
	
	$data = array();
	
	foreach($years as $year)
	{
		$months = get_directory_list($year);
		
		$month_data = array();
		
		foreach($months as $month)
		{
			$playlist = get_playlist($year . "/" . $month);	
			
			$month = str_replace(".xml", "", $month);
			$month = str_replace(" ", "", $month);
			$month = str_replace("-", "", $month);
			$month = preg_replace('/[^\\/\-a-z\s]/i', '', $month);
	
			$month_data[] = array(
				"month" => $month,
				"songs" => $playlist
			);
		}
		
		$data[] = array(
			"year" => $year,
			"months" => $month_data
		);
	}
	
	echo json_encode($data);
	
	function get_playlist($playlist_file)
	{
		// get songs from the xml file
		$songs = iTunesXmlParser($playlist_file);
		
		if ($songs)
		{	
			$output = array();
			
			foreach ($songs as $song)
			{
				$output[] = array(
					"name" => 	$song["Name"],
					"artist" => @$song["Artist"],
					"album" => 	@$song["Album"]
				);
			}

			return $output;
		}	
	}
	
	function get_directory_list($directory) 
	{
		$results = array();
		
		$handler = opendir($directory);
		
		while ($file = readdir($handler))
		{
			if ($file != "." && $file != ".." && $file != "json.php" && $file != "xml_parser.php")
			{
				$results[] = $file;
			}
		}
		
		closedir($handler);
		
		return $results;
	}
?>