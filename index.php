<?php

require 'config.php';
require 'utilities/Auth.php';

function __autoload($class) {
	require LIBS . $class . '.php';
}

$bootstrap = new Bootstrap();
$bootstrap->init();

echo 'here';
