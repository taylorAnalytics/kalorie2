/**
 * The purpose of this script is to manage the training-day checkbox
 *
 * It will:
 * - hide the input element
 * - get the checkbox
 * - add event listener on "change"
 * - when the checkbox is checked show the input element with the value of 300
 * - when the checkbox is not checked hide the input element & clear the value
 *
 */

$(function() {
	// Get the checkbox
	// Get the input element
	$chkBox = $('#training-day');
	$addCal = $('#addCal');
	
	// Add an event handler
	$chkBox.on('change', function() {
		if(this.checked) {
			$addCal.removeClass('hidden');
			$addCal.val(300);
		} else {
			$addCal.addClass('hidden');
			$addCal.val(0);
		}
	});

});