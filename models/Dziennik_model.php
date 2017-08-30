<?php

class Dziennik_Model extends Model
{
	function __construct()
	{
		parent::__construct();
	}

	public function checkTrainingDay() 
	{

		$dataArray = array(
			'user_id' => Session::get('userId'),
			'date' => date('Y-m-d'));
		$sqlQuery = "SELECT addCal FROM Dzien_treningowy WHERE (user_Id=:user_id AND date=:date)";

		$additionalCalories = $this->db->select($sqlQuery, $dataArray);
		return $additionalCalories['addCal'];
	}

	public function saveTrainingDay() 
	{
		$additionalCalories = $_POST['addCal'];
		$trainingDayId = $this->_checkTrainigDayExists();

		if ($trainingDayId == false) {
			$this->_insertTrainingDay($additionalCalories);
		} else {
			$this->_updateTrainingDay($additionalCalories, $trainingDayId);
		}
	}

	private function _checkTrainigDayExists() 
	{
		$dataArray = array(
			'user_id' => Session::get('userId'),
			'date' => date('Y-m-d'));
		$sqlQuery = "SELECT dt_id FROM Dzien_treningowy WHERE (user_Id=:user_id AND date=:date)";

		$data = $this->db->select($sqlQuery, $dataArray);

		if (empty($data)) {
			return false;
		} else {
			return $data['dt_id'];
		}
	}

	private function _insertTrainingDay($additionalCalories) 
	{
		$dataArray = array(
			'user_id' => Session::get('userId'),
			'date' => date('Y-m-d'),
			'addCal' => $additionalCalories);
		$this->db->insert('Dzien_treningowy', $dataArray);
	}

	private function _updateTrainingDay($additionalCalories, $trainingDayId) 
	{
		$dataArray = array(
			'dt_id' => $trainingDayId,
			'user_id' => Session::get('userId'),
			'addCal' => $additionalCalories);
		$this->db->update('Dzien_treningowy', $dataArray, 'dt_id=:dt_id');
	}

	public function getDay() 
	{
		$dataArray = array(
			'user_id' => Session::get('userId'),
			'date' => date('Y-m-d'));

		$sqlQuery = 
			"SELECT ps.Posilek_Id, p.Posilek_nr, ps.Potrawa_Id, po.Potrawa_nazwa, ps.Produkt_Id, pr.Produkt_nazwa,
			ps.Jednostka_Id, j.Jednostka_nazwa, ps.ilosc, ps.kCal, ps.Tluszcze, ps.Weglowodany, ps.Bialko
			FROM Posilki_sklad AS ps
			LEFT JOIN Posilki AS p ON ps.Posilek_Id=p.Posilek_Id
			LEFT JOIN Potrawy AS po ON ps.Potrawa_Id=po.Potrawa_Id
			LEFT JOIN Produkty AS pr ON ps.Produkt_Id=pr.Produkt_Id
			LEFT JOIN Jednostki AS j ON ps.Jednostka_Id=j.Jednostka_Id
			WHERE (p.user_Id=:user_id AND p.date=:date)";

		return $this->db->select($sqlQuery, $dataArray);
	}

	public function getTarget()
	{
		$dataArray = array(
			'user_id' => Session::get('userId'));
		$sqlQuery = "SELECT BMR, redukcja, Tluszcze, Weglowodany, Bialko FROM Cele WHERE user_Id=:user_id";
		return $this->db->select($sqlQuery, $dataArray);
	}

	public function getDishList()
	{
		$sqlQuery = "SELECT DISTINCT Potrawa_Id AS P_Id, Potrawa_nazwa AS P_nazwa FROM Potrawy ORDER BY Potrawa_nazwa ASC";
		return $this->db->select($sqlQuery);
	}

	public function getDishSingle()
	{
		$dataArray = array(
			'potrawa_id' => $_POST['Potrawa_Id']);
		$sqlQuery = "SELECT po.Potrawa_Id, po.Potrawa_nazwa, s.Produkt_Id, pr.Produkt_nazwa, s.Jednostka_Id,  j.Jednostka_nazwa, s.Ilosc, sg.gram_na_szt AS size, pr.kCal, pr.Tluszcze, pr.Weglowodany, pr.Bialko 
		FROM Skladniki AS s
		LEFT JOIN Potrawy AS po ON s.Potrawa_Id=po.Potrawa_Id
		LEFT JOIN Produkty AS pr ON s.Produkt_Id=pr.Produkt_Id
		LEFT JOIN Jednostki AS j ON s.Jednostka_Id=j.Jednostka_Id
		LEFT JOIN sztuki_gramy AS sg ON s.Produkt_Id=sg.Produkt_Id
		WHERE s.Potrawa_Id=:potrawa_id";

		return $this->db->select($sqlQuery, $dataArray);
	}

	public function getProductList()
	{
		$sqlQuery = "SELECT DISTINCT Produkt_Id AS P_Id, Produkt_nazwa AS P_nazwa FROM Produkty ORDER BY Produkt_nazwa ASC";
		return $this->db->select($sqlQuery);
	}

	public function getProductSingle()
	{
		$dataArray = array(
			'product_id' => $_POST['Produkt_Id']);
		$sqlQuery = "SELECT p.Produkt_Id, p.Produkt_nazwa, p.kCal, p.Tluszcze, p.Weglowodany, p.Bialko, j.Jednostka_nazwa AS primary_unit, s.gram_na_szt AS size
			FROM Produkty AS p LEFT JOIN Jednostki AS j ON p.primary_unit=j.Jednostka_Id LEFT JOIN sztuki_gramy AS s ON p.Produkt_Id=s.Produkt_Id
			WHERE p.Produkt_Id=:product_id";

		return $this->db->select($sqlQuery, $dataArray);
	}

	public function saveMeal()
	{
		$date = date('Y-m-d');
		$userId = Session::get('userId');
		$ingredients = json_decode(file_get_contents("php://input"), true);

		$mealNo = $this->_countMeals($date);
		$mealId = $this->_insertMeal($mealNo, $userId);
		$this->_insertIngredients($mealId, $userId, $ingredients);
	}

	private function _countMeals($date)
	{
		$dataArray = array(
			'date' => $date);
		$sqlQuery = "SELECT COUNT(Posilek_Id) FROM Posilki WHERE date=:date";
		$mealCount = $this->db->select($sqlQuery, $dataArray, PDO::FETCH_NUM);
			return $mealCount[0];
	}

	private function _insertMeal($mealNo, $userId)
	{
		
	}

}