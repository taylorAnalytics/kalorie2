<?php

class Index extends Controller {

	function __construct() {
		parent::__construct();
	}

	function index() {
		$this->view->title = 'Licznik kalorii dla Ciebie';
		$this->view->render('index/index');
	}
}