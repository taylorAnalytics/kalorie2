/** The purpose of this script is to define the functions that will be used in the daily results table
 *
 * The Script will define following funcions:
 * - get_target() - it will get the data about daily goals from "Cele" table from the MySQL database
 * - get_day() - it will get the data about the daily consumption & all the meals eaten (from MySQL as well)
 * - training_day() - it will check if it is a training day & what calorie surplus is assumed for that day (will it work with MySQL? I guess as well)
 * - fill_day() - it will fill the daily results row with daily consumption data
 * - calculate_indicators() - it will compare the calculated targets with the daily consumption to calculate all indicators (% consumed & numbers left to consume)
 * - fill_indicators() - it will fill the percent-row & rest-row with the results of indicators calculations
 *
 */


// Define the get_target() function
function get_target(addCal) {
	
	var url = 'dziennik/getTarget'; // Define the url to proceed with php
	// Define ajax request
	$.ajax({
		url: url,
		type: "GET",
		success: function(response) {
			// Retrieve the targets
			var targets = JSON.parse(response);
			var kCalTarget = targets.BMR - targets.redukcja; // Variable to store the kCal target, initially retrieved from MySQL through AJAX
			var tluszczePerCent = targets.Tluszcze / 100; // Variagle to store fat percentage from the target
			var weglowodanyPerCent = targets.Weglowodany / 100; // Variagle to store carbs percentage from the target
			var bialkoPerCent = targets.Bialko / 100; // Variagle to store protein percentage from the target

			// Calculate the target numbers for everything
			kCalTarget += addCal; // Modify the kCal target based on the addCal value
			var tluszczeGram = Number(kCalTarget * tluszczePerCent / 9).toFixed(0); // Calculate the tluszcze target consumption in grams based on their target percentage
			var weglowodanyGram =Number(kCalTarget * weglowodanyPerCent / 4).toFixed(0); // Same for weglowodany
			var bialkoGram = Number(kCalTarget * bialkoPerCent / 4).toFixed(0); // Same for bialko

			// Fill the target-row with target numbers
			$('#target-kcal').text(kCalTarget); // Fill the kCal target
			$('#target-t').text(tluszczeGram); // Fill the tluszcze target
			$('#target-w').text(weglowodanyGram); // Fill the weglowodany target
			$('#target-b').text(bialkoGram); // Fill the bialko target

			calculate_indicators();	
				
		}
	}); // End of get_target() function definition
}
// Define the check_training_day() function
function check_training_day() {
	var url = 'dziennik/checkTrainingDay'; // Define the url for the AJAX request
	$.ajax({
		url: url,
		type: "GET",
		success: function(response) {
			var data = JSON.parse(response); // Get the response from AJAX
			var addCal = Number(data); // Store it as a number in a variable

			// If addCal > 0 then check the training day checkbox & fill the input box with the value of the addCal variable
			var $trainingDay = $('#training-day'); // Get the checkbox into a variable
			var $addCal = $('#addCal'); // Get the input box & store it in a variable

			if (addCal > 0) { // The value is greater then 0, so it is a training day
				$trainingDay.prop('checked', true);
				$addCal.val(addCal).removeClass('hidden');
			}

			get_target(addCal); // Call the get_target() function to fill the table with proper numbers	

		}
	});
} // End of check_training_day() function declaration

// Declare the save_training_day() function
function save_training_day(addCal) {
	// Define the elements of the POST ajax request to send the addCal value to php site & have it update the MySQL database
	var url = 'dziennik/saveTrainingDay'; // Define the url
	var ajaxData = {'addCal': addCal};
	
	$.ajax({
		url: url,
		type: "POST",
		data: ajaxData
	}); // End of AJAX request
} // End of save_training_day() function definition

// Declare the get_day() function
function get_day() {
	// Get data from the MySQL database & fill it into the day-results table
	var url = 'dziennik/getDay'; // Define the url to handle the AJAX request
	$.ajax({
		url: url,
		type: "GET",
		success: function(response) {
			var dayData = JSON.parse(response);
			var kCalTotal = 0; // Variable to count all calories consumed during the day
			var tluszczeTotal = 0; // Variable to count tluszcze
			var weglowodanyTotal = 0; // Variable to count weglowodany
			var bialkoTotal = 0; // Variable to count bialko
			dayData.forEach(function(data) {
				kCalTotal += Number(data.kCal);
				tluszczeTotal += Number(data.Tluszcze);
				weglowodanyTotal += Number(data.Weglowodany);
				bialkoTotal += Number(data.Bialko);
			});

			fill_result(kCalTotal, tluszczeTotal, weglowodanyTotal, bialkoTotal);
			calculate_indicators();
		} // End of success funciton definition
	}); // End of AJAX request

} // End of get_day() function definition

// Declare the fill_result() function
function fill_result(kCal, t, w, b) {
	var $resultKCal = $('#result-kcal'); // Get the <td> element from the result table responsible for kCal
	var $resultTluszcze = $('#result-t'); // Get the one for tluszcze
	var $resultWeglowodany = $('#result-w'); // Get the one for weglowodany
	var $resultBialko = $('#result-b'); // Get the one for bialko

	$resultKCal.text(kCal); // Fill it with the sum of the day's kCal
	$resultTluszcze.text(t);
	$resultWeglowodany.text(w);
	$resultBialko.text(b);
} // End of fill_result() function definition

// Declare calculate_indicators() function
function calculate_indicators() {
	// Get all the elements of the results table that will be the base for all the calculations
	var $resultKCal = $('#result-kcal');
	var $resultTluszcze = $('#result-t');
	var $resultWeglowodany = $('#result-w');
	var $resultBialko = $('#result-b');
	var $targetKCal = $('#target-kcal');
	var $targetTluszcze = $('#target-t');
	var $targetWeglowodany = $('#target-w');
	var $targetBialko = $('#target-b');
	// Calculate the percentage values
	var kCalPerCent = Number(Number($resultKCal.text()) / Number($targetKCal.text())).toFixed(2) * 100;
	var tluszczePerCent = Number(Number($resultTluszcze.text()) / Number($targetTluszcze.text())).toFixed(2) * 100;
	var weglowodanyPerCent = Number(Number($resultWeglowodany.text()) / Number($targetWeglowodany.text())).toFixed(2) * 100;
	var bialkoPerCent = Number(Number($resultBialko.text()) / Number($targetBialko.text())).toFixed(2) * 100;
	var kCalLeft = Number(Number($targetKCal.text()) - Number($resultKCal.text())).toFixed(0);
	if (kCalLeft < 0) {
		kCalLeft = 0;
	}
	kCalPerCent += '%';
	tluszczePerCent += '%';
	weglowodanyPerCent += '%';
	bialkoPerCent += '%';
	// Get the <td>s from the percent indicators row & fill with the percent numbers
	$('#percent-kcal').text(kCalPerCent);
	$('#percent-t').text(tluszczePerCent);
	$('#percent-w').text(weglowodanyPerCent);
	$('#percent-b').text(bialkoPerCent);
	$('#left-kcal').text(kCalLeft);

}


