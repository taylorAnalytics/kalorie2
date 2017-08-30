<?php

class Auth
{
	function __construct() {}

	public static function handleLogin() {
		Session::init();
		$loggedIn = Session::get('loggedIn');
		if (!$loggedIn) {
			Session::destroy();
			header('location:' . URL . 'login');
			exit;
		}
	}
}