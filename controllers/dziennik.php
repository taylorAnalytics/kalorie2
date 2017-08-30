<?php


class Dziennik extends Controller
{
	
	function __construct()
	{
		parent::__construct();
		Auth::handleLogin();
		$this->view->js = array(
			'dziennik/js/results_table_functions.js',
			'dziennik/js/training-day.js',
			'dziennik/js/results_table_events.js',
			'dziennik/js/form-posilek.js',
			'dziennik/js/form-produkt.js',
			'dziennik/js/another_product.js');
	}

	public function index()
	{
		$this->view->title = 'Dziennik kalorii';
		$this->view->render('dziennik/index');
	}

	public function checkTrainingDay()
	{
		$additionalCalories = $this->model->checkTrainingDay();
		echo json_encode($additionalCalories);
	}

	public function saveTrainingDay() 
	{
		$this->model->saveTrainingDay();
	}

	public function getDay()
	{
		$dayData = $this->model->getDay();
		echo json_encode($dayData);
	}

	public function getTarget()
	{
		$target = $this->model->getTarget();
		echo json_encode($target);
	}

	public function getDishList()
	{
		$dishList = $this->model->getDishList();
		echo json_encode($dishList);
	}

	public function getProductList()
	{
		$productList = $this->model->getProductList();
		echo json_encode($productList);
	}

	public function getDishSingle()
	{
		$dishInfo = $this->model->getDishSingle();
		echo json_encode($dishInfo);
	}
	public function getProductSingle()
	{
		$productInfo = $this->model->getProductSingle();
		echo json_encode($productInfo);
	}

	public function saveMeal()
	{
		$this->model->saveMeal();
	}

}