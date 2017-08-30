<?php

class Login_Model extends Model
{
	private $_usernameProvided = null;
	private $_passwordProvided = null;
	private $_usernameStored = null;
	private $_passwordStored = null;
	private $_role = null;
	private $_userId = null;

	function __construct()
	{
		parent::__construct();
	}


	public function sanitizeUserInput() 
	{
		$this->_usernameProvided = strip_tags(trim($_POST['username']));
		$this->_passwordProvided = strip_tags(trim($_POST['password']));
	}

	public function checkUserExists()
	{
		if ($this->_usernameStored == null) {
			return false;
		} else {
			return true;
		}
	}

	public function verifyPassword()
	{
		if (password_verify($this->_passwordProvided, $this->_passwordStored)) {
			return true;
		} else {
			return false;
		}
		
	}

	public function executeLogin()
	{
		Session::init();
		Session::set('loggedIn', true);
		Session::set('username', $this->_usernameStored);
		Session::set('role', $this->_role);
		Session::set('userId', $this->_userId);
	}

	public function getUserData() {

		$dataArray = array(
			'username' => $this->_usernameProvided
			);
		$sqlQuery = 'SELECT username, password, role, user_Id FROM users WHERE username=:username';

		$dataRetrieved = $this->db->select($sqlQuery, $dataArray);

		if ($dataRetrieved == null) {
			$this->_usernameStored = null;
		} else {
			$this->_usernameStored = $dataRetrieved['username'];
			$this->_passwordStored = $dataRetrieved['password'];
			$this->_role = $dataRetrieved['role'];
			$this->_userId = $dataRetrieved['user_Id'];
		}
	}
}