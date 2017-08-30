/**
 * The purpose of this script is to add a new row once the user clicks the "dodaj" <button>
 *
 * The script will:
 * - add an event handler to the "dodaj" <button> on('click')
 * - get the parent row containing this button
 * - clone the row
 * - clear the content that needs to be cleared
 * - add the new row to the end of the form.
 *
 */

$(function() {
	var $dodajButtons = $('.dodaj'); // Get all the "dodaj" buttons

	// Add event listener
	$dodajButtons.on('click', function(e) {
		var $this = $(e.target); // Get the button that was actually clicked
		var $trParent = $this.parent().parent(); // Get the parent row
		var $trClone = $trParent.clone(true); // Copy the parent row
		// Clean the new row of all it's values
		$trClone.removeAttr('data-potrawa_id'); // Clear potrawa_id attribute
		$trClone.removeClass('prod'); // Remove attribute "prod" that says that this row contains a product
		$trClone.find('.wybor').children(':gt(0)').remove(); // Remove all the products from the list
		$trClone.find('.option-sztuki').attr('disabled', 'disabled'); // Disable "sztuki" jednostka
		$trClone.find('.option-gramy').attr('disabled', 'disabled'); // Disable "gramy" jednostka
		$trClone.find('.jednostka').removeClass('hidden'); // Remove the "hidden" class if there was one on 'jednostka'
		$trClone.find('.ilosc').val('').removeClass('hidden'); // Clear value of "ilość" & remove "hidden" class if there was one
		$trClone.find('.kCal').text(''); // Clear value of kCal
		$trClone.find('.tluszcze').text(''); // Clear value of kCal
		$trClone.find('.weglowodany').text(''); // Clear value of kCal
		$trClone.find('.bialko').text(''); // Clear value of kCal
		$trClone.find('.potrawa-zwin').addClass('hidden').text('Zwiń'); // Add back the 'hidden' class in case it has been removed & change the text back to 'Zwiń'

		$('tr.submit-button').before($trClone);
	});


});