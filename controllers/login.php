<?php

class Login extends Controller
{
	function __construct()
	{
		parent::__construct();
		$this->view->js = array('login/js/login.js');
	}

	public function index()
	{
		$this->view->title = 'Zaloguj się';
		$this->view->render('login/index');
	}

	public function run()
	{
		$this->_sanitizeUserInput();
		$this->_getUserData();
		if ($this->_checkUserExists()) {
			if ($this->_verifyPassword()) {
				$this->_executeLogin();
				echo 'login';
			} else {
				echo 'The password does not match';
			}
		} else {
			echo 'The user does not exist in the database';
		}
	}

	private function _sanitizeUserInput() 
	{
		$this->model->sanitizeUserInput();
	}

	private function _getUserData() {
		$this->model->getUserData();
	}

	private function _checkUserExists()
	{
		return $this->model->checkUserExists();
	}

	private function _verifyPassword()
	{
		return $this->model->verifyPassword();
	}

	private function _executeLogin()
	{
		$this->model->executeLogin();
	}
}