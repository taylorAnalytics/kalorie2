/**
 * The purpose of this script is to design event handlers to manage the data in the results table
 *
 * This script will define following event handlers:
 * - click on training day checkbox
 * - blur on training day input box (after the checkbox has been checked)
 * - submit of "posiłek" form
 * - loading of the page as such
 *
 */

$(function() {
	check_training_day();
	get_day();
}());

$(function() {
	// Define click on the training day checkbox event handler
	var $trainingDay = $('#training-day'); // Get the checkbox & store it in a variable

	$trainingDay.on('change', function() {
		var addCal = 0; // Define the additional calories variable

		if (this.checked) { // The training day checkbox has been checked
			addCal = 300;
			save_training_day(addCal);
		} else { // The training day checkbox has been unchecked
			addCal = 0;
			save_training_day(addCal);
		}

		get_target(addCal); // Use the get_target function to get the latest data about the users target figures		

	});

	// Define the blur on training day input box event
	var $addCal = $('#addCal'); // Get the input box
	$addCal.on('blur', function() {
		var addCal = Number($addCal.val()); // Store the value of the input box in a variable
		save_training_day(addCal);
		get_target(addCal); // Call the function to get & calculate the targets
	})

});