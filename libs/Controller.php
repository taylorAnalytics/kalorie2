<?php

class Controller {

	function __construct() {
		$this->view = new View();
	}

	public function loadModel($modelName, $modelPath = 'models/')
	{
		$path = $modelPath . $modelName . '_model.php';

		if (file_exists($path)) {
			require $path;

			$model = $modelName . '_Model';
			$this->model = new $model();
		}
	}
}