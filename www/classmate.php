<?php

header('content-type: application/json; charset=utf-8');

$name = trim($_GET['name']);
$pass = trim($_GET['pass']);
$tag = trim($_GET['tag']);
$json_data = array();

if(empty($name)) {
 	echo setRes(400, "nameは必須です", $json_data);
 	return;
}
if(empty($pass)) {
 	echo setRes(400, "passは必須です", $json_data);
 	return;
}
if(empty($tag)) {
	echo setRes(400, "tagは必須です", $json_data);
	return;
}

//$json_file = file_get_contents("/var/www/classmate/www/classmate.json");


if (empty($json_file)) {
	$json_data['id']   = 1;
	$json_data['name'] = $pass;
	$json_data['tag'] = $tag;
} else {
	$json = json_decode($json, true);
	
	
}


$json = fopen("classmate.json", "w+");
var_dump(json_encode($json_data));
var_dump($json);
fwrite($json, json_encode($json_data));
fclose($json);


function setRes($code, $msg, $data){
	$res = array(
		'status' => array(
				code => 200, 
				msg  => 'ok',
		),
		'data' => null
	);
	$res['status']['code'] = $code;
	$res['status']['msg']  = $msg;
	
	// 200だったらdataを設定する
	if ($code == 200) {
		$res['data'] 		   = $data;
	}
	
	
	return json_encode($res);
	
}
