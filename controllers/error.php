<?php

class ErrorController extends Controller {

	function __construct() {
		parent::__construct();
	}

	function index() {
		$this->view->title = 'Page doesn\'t exist';
		$this->view->message = 'The page you requested does not exist';
		$this->view->render('error/index');
	}
}