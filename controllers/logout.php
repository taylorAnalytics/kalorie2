<?php

class Logout extends Controller
{
	function __construct() {
		parent::__construct();
	}

	function index() {
		Session::init();
		Session::destroy();
		header('location:login');
	}

}