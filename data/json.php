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
			$month_file = $year . "/" . $month;
			
			$month_parts = str_replace(".xml", "", $month);
			$month_parts = preg_replace('/\?/', "", $month_parts);
			$month_parts = str_replace("-", "", $month_parts);
			$month_parts = str_replace("(", "", $month_parts);
			$month_parts = str_replace(")", "", $month_parts);
			$month_parts = explode(" ", $month_parts);
			
			$month_name = $month_parts[1];
			$month_number = $month_parts[0];
			
			$playlist = get_playlist($month_file, $year, $month_number);	
	
			$month_data[] = array(
				"month" => 	$month_name,
				"songs" => 	$playlist
			);
		}
		
		$data[] = array(
			"year" => $year,
			"months" => $month_data
		);
	}
	
	echo json_encode($data);
	
	function get_playlist($playlist_file, $year, $month)
	{
		// get songs from the xml file
		$songs = iTunesXmlParser($playlist_file);
		
		$path_root = "music/" . $year . "/" . $month . "/";
		
		if ($songs)
		{	
			$output = array();
			
			foreach ($songs as $song)
			{
				$file_name = strtolower($song['Name']);
				$file_name = str_replace(" ","-",$file_name);
				$file_name = $file_name . ".mp3";
				
				$output[] = array(
					"name" => 	$song["Name"],
					"artist" => @$song["Artist"],
					"album" => 	@$song["Album"],
					"path" =>	$path_root . $file_name
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