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
	var $dodajButtons = $('.dodaj-skladnik'); // Get all the "dodaj" buttons

	// Add event listener
	$dodajButtons.on('click', function(e) {
		var $this = $(e.target); // Get the button that was actually clicked
		var $trParent = $this.parent().parent(); // Get the parent row
		var $trClone = $trParent.clone(true); // Copy the parent row
		// Clean the new row of all it's values
		$trClone.find('.option-sztuki').attr('disabled', 'disabled'); // Disable "sztuki" jednostka
		$trClone.find('.option-gramy').attr('disabled', 'disabled'); // Disable "gramy" jednostka
		$trClone.find('.ilosc').val(''); // Reset the value of the "ilosc" field
		$trClone.find('.kCal').text(''); // Clear value of kCal
		$trClone.find('.tluszcze').text(''); // Clear value of kCal
		$trClone.find('.weglowodany').text(''); // Clear value of kCal
		$trClone.find('.bialko').text(''); // Clear value of kCal
		
		// Get & apply the list of products to the new "skladnik" row
		var $skladnikWybor = $trClone.find('.wybor');
		var url='ajax/product_list.php'; // Define the url that will handle the ajax request
		// Define the ajax
		$.ajax ({
			type: "GET",
			url: url,
			success: function(data) {
				var products = JSON.parse(data);
				product_list(products, $skladnikWybor);
			}
		}); // End of AJAX request
		$('tr.zapisz-skladnik').before($trClone);
	});

	// Define the function to create product list
	function product_list(products, $field) {
		$field.html('<option selected disabled>Wybierz...</option>');
		var prodList = ''; // Define the variable that will contain HTML markup with <options>
		products.forEach(function(product) {
			prodList += '<option value="' + product.P_Id + '">' + product.P_nazwa + '</option>';
		});
		$field.append(prodList);
	} // End of product_list() function definition


});