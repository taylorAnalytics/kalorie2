/**
 * The purpose of this script is to manage the events & functions within the new_potrawa functionality & potrawa_form.html file
 *
 * This script will fulfil following functionalities:
 * - Event of "nowa potrawa" button - unhide the table, fill in the list of products for the first "skladnik" row visible
 * - Form validation - when user inserts the name of potrawa & leaves the field, it should be checked against RegEx
 * - "Ilosc" input field should be checked to be numeric
 * - "Usun" buttons events & functionalities (reset the fields & remove the row or the whole form if there is nothing more to delete)
 * - "Dodaj" button & it's functionality of adding a new, clean row for a new "skladnik"
 * - "produkt" select field - event - fill in the unit and product data
 * - "jednostka" select field - event - change the value of "ilość" field
 * - "ilosc" field - event - recalculate the nutrition values depending on the ilosc & update the total value of the "potrawa" numbers
 * - "zapisz" field - event - save the potrawa in the MySQL database, clear & close the form
 *
 */

$(function() {

	var $newPotrawa = $('#nowa-potrawa'); // Get the "nowa potrawa" button & store it in a variable
	var $potrawaTable = $('table.nowa-potrawa'); // Get the table containing the form

	$newPotrawa.on('click', function() {
		$potrawaTable.removeClass('hidden'); // Unhide the table containing "nowa potrawa" form

		var $firstProduct = $potrawaTable.find('select.wybor'); // Get the <select> element of the first "skladnik"
		var url='ajax/product_list.php'; // Define the url that will handle the ajax request
		// Define the ajax
		$.ajax ({
			type: "GET",
			url: url,
			success: function(data) {
				var products = JSON.parse(data);
				product_list_potrawa(products, $firstProduct);
			}
		}); // End of AJAX request	
	});

	/* This block of code will validate the input field for "potrawa nazwa" to check if it exists in MySQL database*/

	var $potrawaNazwa = $('#nowa-potrawa-nazwa'); // Get the input field for the name of the "potrawa"
	var $iloscInputs = $('tbody.nowa-potrawa input.ilosc'); // Get all the fields containing the "ilosc" values
	var nameValidated = false;

	$potrawaNazwa.on('blur', function() { // Add an event handler to check if the value inputted is words, numbers & semicolon only
		validate_fields_potrawa($potrawaNazwa, $iloscInputs); // Run the validation function
		var $this = $(this); // Get the potrawa nazwa input field (this field that is blurred)
		var potrawaName = $this.val(); // Get the value of the field & store it in a variable
		var $checkNazwaError = $('tbody.nowa-potrawa').find('.nazwa-check-error'); // Get the <td> element with the error message of "check-nazwa"
		// Prepare the ajax request
		var data = ({Potrawa_nazwa: potrawaName}); // Store the potrawa nazwa in a JSON data
		data = JSON.stringify(data); // Stringify it
		var url = 'ajax/check_potrawa_nazwa.php';
		$.ajax ({
			type: "POST",
			url: url,
			data: data,
			dataType: 'json',
			success: function(response) {
				if (response===true) { // If there is the name in the database
					$checkNazwaError.removeClass('hidden'); // Unhide the error message
				} else if (response===false) { // There is no such name in the database
					$checkNazwaError.addClass('hidden'); // Hide the error message
				}
			}
		});
	});

	/* The next block of code will save potrawa in the database (The most important part of this script's cocde) */
	var $zapiszButton = $('tbody.nowa-potrawa button.zapisz'); // Get the "zapisz" button
	$zapiszButton.on('click', function() {
		/* What this event handler should do:
		 * - validate the fields again
		 * - define the "skladnik" object
		 * - create an array that will store the "skladnik" informations - an array of objects
		 * - create the variable that will store "potrawa" information - basically only Potrawa_nazwa
		 * - get all the rows containing "skladniki" & save the information in a "skladnik" object & save it in the array
		 * - get the value of the field containing Potrawa_nazwa
		 * - check if all fields have been filled
		 * - use an AJAX request to create & save the Potrawa_nazwa in Potrawy table in MySQL (also, check again if it already exists or not)
		 * - if that succedes, send another AJAX (within the previous one) to save the "skladniki" in Skladniki table in MySQL
		 * - report the success
		 */
		
		

		var $skladnikRows = $('tbody.nowa-potrawa tr.skladnik'); // Get the rows containing product information
		var skladnikiLista = new Array(); // Define a variable that will store all the "skladniki" information
		var potrawaName = $potrawaNazwa.val(); // Get the value of the $potrawaNazwa input field
		var allFilled = true; // Define the flag variable to check if all fields have been filled
		var $allFilledError = $('tbody.nowa-potrawa td.allFilled-error'); // Get the <td> element containing the error message in case not all fields have been filled

		if (validate_fields_potrawa($potrawaNazwa, $iloscInputs)) { // If the fields can be validated - continue the process
			$skladnikRows.each(function() {
				var $this = $(this);
				
				// Define the "Skladnik" class
				var skladnik = {
					Produkt_Id: "",
					Jednostka: "",
					Ilosc: 0
				}

				var Produkt_Id = $this.find('.wybor').val();
				var Jednostka = $this.find('.jednostka').val();
				var Ilosc = $this.find('.ilosc').val();

				if (Produkt_Id!=='') { // The field is not empty, it has been selected
					skladnik.Produkt_Id = Produkt_Id; // Save the value of Produkt_Id in the object
				} else { // The field is empty
					allFilled = false; // Change the flag to false (not all fields have been filled)
				}

				if (Jednostka!=='') { // The field is not empty, it has been selected
					skladnik.Jednostka = Jednostka; // Save the value of Jednostka in the object
				} else {
					allFilled = false;
				}

				if(Ilosc!==0 && Ilosc!=='') { // The field is not empty
					skladnik.Ilosc = Ilosc; // Save the value of Ilosc in the object
				} else { // It is empty
					allFilled = false;
				}

				if (allFilled) { // All fields have been filled
					skladnikiLista.push(skladnik); // Add "skladnik" to the list of "skladniki"
				}

			}); // End of skladniki each loop

			if (potrawaName==='') { // Potrawa_nazwa is empty
				allFilled = false;
			}

			if (allFilled) { // All fields have been filled
				$allFilledError.addClass('hidden'); // Hide the error message
				// Prepare the AJAX request to save Potrawa_nazwa & create Potrawa_Id
				var nazwaData = ({Potrawa_nazwa: potrawaName}); // stringify & save the name of "potrawa" to serve as data input for AJAX
				nazwaData = JSON.stringify(nazwaData); // stringify & save the name of "potrawa" to serve as data input for AJAX
				var url = 'ajax/check_potrawa_nazwa.php'; // Specify AJAX url
				$.ajax({
					type: "POST",
					data: nazwaData,
					url: url,
					dataType: 'json',
					success: function(response) {
						if (response === false) { // If nazwa does not exist in the database - follow with saving the Potrawa
							// Prepare another AJAX request
							url = 'ajax/save_potrawa.php'; // Define new url to handle ajax request that saves the Potrawa in MySQL database
							$.ajax({
								type: "POST",
								data: nazwaData,
								url: url,
								dataType: 'json',
								success: function(response) {
									var Potrawa_Id = response; // Save the returned Potrawa_Id in a variable
									var Potrawa = new Object(); // Create a new object - Potrawa (it will hold the name & skladniki)
									Potrawa.Potrawa_Id = Potrawa_Id; // Save Potrawa_Id as a property of Potrawa object
									Potrawa.skladniki = skladnikiLista; // Save skladniki array as a property of Potrawa object
									var potrawaData = JSON.stringify(Potrawa); // Stringify the Potrawa object
									url = 'ajax/save_skladniki.php'; // Define the url to save the "skladniki" of the "Potrawa"
									$.ajax({ // Run the ajax request
										type: "POST",
										data: potrawaData,
										url: url,
										datetype: 'json',
										success: function(response) {
											status = JSON.parse(response);
											if (status === 'saved') { // Potrawa & skladniki have been succesfully saved
												// Clear the whole "nowa potrawa form"
												$usunPotrawaButton.trigger('click');
												alert('Nowa potrawa została zapisana w bazie');
											}
										}
									});
								}
							});
						}
					}
				});
			} else { // Otherwise
				$allFilledError.removeClass('hidden'); // Unhide the error message
			}
		}
	});

	/* End of this most important block of code */

	$iloscInputs.on('blur', function() { // Add an event handler to check if the value inputted in "ilosc" field is numbers
		validate_fields_potrawa($potrawaNazwa, $iloscInputs); // Run the validation function
	})

	var $prodSelect = $('tbody.nowa-potrawa select.wybor'); // Get all the Produkt <select> elements
	// Add an event listener to all produkt select lists
	$prodSelect.on('change', function(e) {
		var $changedProduct = $(e.target); // Get the target of the change event, the list that was actually changed
		var $trParent = $changedProduct.parent().parent(); // Get its parent
		var $jednostka = $trParent.find('.jednostka');

		// Disable all the "jednostki"	
		$jednostka.find('.option-gramy').attr('disabled', 'disabled');
		$jednostka.find('.option-sztuki').attr('disabled', 'disabled');
		var product_id = $changedProduct.val(); // Get the product id from the <option> element. It will be used as an argument for the $.ajax call
		var url = 'ajax/get_product.php';
		var data = ({Produkt_Id: product_id});
		// Do the AJAX request
		$.ajax({
			type: "POST",
			data: data,
			dataType: 'json',
			url: url,
			success: function(response) {
				var product = response[0];
				fill_product_potrawa(product, $trParent);
				sum_nowa_potrawa();
			}
		});
	});

	var $inputIlosc = $('tbody.nowa-potrawa input.ilosc'); // Get all the "ilość input elements"
		// Add event listener
		$inputIlosc.on('blur', function(e){
			$this = $(e.target); // Get the target of the event
			var $input = $this.val(); // Get the new value of the 
			var $trParent = $this.parent().parent(); // Get the row of the table, where the event happened
			var $prodSelect = $trParent.find('.produkt'); // Get the product select element
			var product_id = $prodSelect.val() || $prodSelect.attr('data-product_id'); // Get the value of the product id in this row of the table
			var $selectJednostka = $trParent.find('.jednostka'); // Find & get the "jednostka" select field
			var $jednostka = $selectJednostka.val() || $selectJednostka.text(); // Get the value of jednostka
			// Prepare the AJAX request
			var url = 'ajax/get_product.php';
			var data = ({Produkt_Id: product_id});
			// Do the AJAX request
			$.ajax({
				type: "POST",
				data: data,
				dataType: 'json',
				url: url,
				success: function(response) {
					var product = response[0];
					// Check what the value of "jednostka" is & act accordingly
					if ($jednostka === 'sztuki' || $jednostka === 'Sztuki') { // It's "sztuki"
						var kCal = Number((product.kCal / 100) * product.size * $input).toFixed(0);
						var tluszcze = Number((product.Tluszcze / 100) * product.size * $input).toFixed(0);
						var weglowodany = Number((product.Weglowodany / 100) * product.size * $input).toFixed(0);
						var bialko = Number((product.Bialko / 100) * product.size * $input).toFixed(0);
					} else if ($jednostka === 'gramy' || $jednostka === 'Gramy') { // It's "gramy"
						var kCal = Number((product.kCal / 100) * $input).toFixed(0);
						var tluszcze = Number((product.Tluszcze / 100) * $input).toFixed(0);
						var weglowodany = Number((product.Weglowodany / 100) * $input).toFixed(0);
						var bialko = Number((product.Bialko / 100) * $input).toFixed(0);
					}
					// Fill the fields with the new values
					fill_values_potrawa($trParent, kCal, tluszcze, weglowodany, bialko);
					// Find the <td> element with the attribute data-potrawa_id
					var $tdEl = $trParent.find('[data-potrawa_id]'); // Get the <td> element that should have the data attribute
					potrawa_id = $tdEl.attr('data-potrawa_id'); // Read the value of the attribute=potrawa_id (if it has one)
					if (potrawa_id) { // If there was a value to the attribute
						$fatherRow = $("tr[data-potrawa_id='" + potrawa_id + "']");
						sum_potrawa(potrawa_id, $fatherRow);
					}
					sum_nowa_potrawa();
				} // End of success function
			}); // End of AJAX request
		}); // End of $inputIlosc event listener

	/* The next block of code adds an event listener to "usun" button & deletes the potrawa or produkt */
	var $usunSkladnikButtons = $('tbody.nowa-potrawa tr.skladnik button.usun'); // Get all the "usuń" buttons for "skladniki"

	$usunSkladnikButtons.on('click', function(e) { // Add an event handler to them
		var $this = $(e.target); // Get the taget of the event - the one button that was clicked
		var $trParent = $this.parent().parent(); // Get the parent <tr> for that butto
		var $skladnikRows = $('tbody.nowa-potrawa tr.skladnik'); // Get all the <tr> elements containing "skladnik" information

		if ($skladnikRows.length > 1) { // There is more than one input row	
			$trParent.remove();
		} else { // There is only one input row
			$trParent.find('.wybor').children(':eq(0)').prop('selected', true); // Remove all the products from the list
			$trParent.find('.option-sztuki').attr('disabled', 'disabled'); // Disable "sztuki" jednostka
			$trParent.find('.option-gramy').attr('disabled', 'disabled'); // Disable "gramy" jednostka
			$trParent.find('.default').prop('disabled', false).prop('selected', true).prop('disabled', true); // Select the base "jednostka"
			$trParent.find('.ilosc').val(''); // Clear the value of ilosc
			$trParent.find('.kCal').text(''); // Clear value of kCal
			$trParent.find('.tluszcze').text(''); // Clear value of kCal
			$trParent.find('.weglowodany').text(''); // Clear value of kCal
			$trParent.find('.bialko').text(''); // Clear value of kCal
		}
		sum_nowa_potrawa();
	}); // End of usunButton event handler

	var $usunPotrawaButton = $('tbody.nowa-potrawa tr.potrawa button.usun');
	$usunPotrawaButton.on('click', function(e) {
		var $this = $(e.target); // Get the button that was just clicked		

		$usunSkladnikButtons = $('tbody.nowa-potrawa tr.skladnik button.usun'); // Get all the "usuń" buttons for "skladniki"
		$usunSkladnikButtons.each(function() {
			var $this = $(this); // Get this button that the loop regards
			$this.trigger('click'); // Click it
		});

		$potrawaNazwa.val(''); // Reset the value of the "nazwa" input field
		$potrawaTable.addClass('hidden'); // Hide the table

	});

	// Define the function that will check if all the product fields are validated
	function validate_fields_potrawa($tInput, $nInput) {
		var textValidated = true; // A flag variable to check if the text input has been validated
		var numbersValidated = true; // A flag variable to check if the number inputs have been validated
		var $textErrorField = $('tbody.nowa-potrawa').find('.nazwa-error'); // Get the <td> with the error message for text input
		var $numbersErrorField = $('tbody.nowa-potrawa').find('.ilosc-error'); // Get the <td> with the error message for number input
		// Check the text input field
		var textValue = $tInput.val(); // Get the value of the text input
		var textRegEx = /^[ \w,%]*$/; // Define the pattern - any word character (letters or digits)
		if (!textRegEx.test(textValue)) { // The text input doesn't match the pattern
			textValidated = false; // Turn the flag into false
		}

		// Check the number input fields
		$nInput.each(function() {
			var $this = $(this); // Get this particular number input field
			var value = $this.val(); // Get the value of the input field
			if (!$.isNumeric(value) && value !== '') { // The value of the field is not numeric
				numbersValidated = false; // Turn the flag into false
			}
		});

		// Check if the fields have been validated & toggle the display of the error messages
		if (textValidated) { // It's ok
			$textErrorField.addClass('hidden');
		} else { // It hasn't been validated
			$textErrorField.removeClass('hidden');
		}
		if (numbersValidated) { // All number fields have been validated
			$numbersErrorField.addClass('hidden');
		} else { // At least one number field has not been validated
			$numbersErrorField.removeClass('hidden');
		}

		return (textValidated && numbersValidated); // Return the result - "true" if both types of fields have been validated
	}

	// Define the function that will fill in product values & store product info
	function fill_product_potrawa(product, $row) {
		
		var unit = product.primary_unit; // Define what the primary unit is
		var $jednostka = $row.find('.jednostka'); // Get the "jednostka" select field
		// Get the "ilosc" input field
		var $ilosc = $row.find('.ilosc');
		
		// Enable <options> in "Jednostka" <select> element
		if (product.size!=null) { // If there is a size per unit for the product
			$jednostka.find('.option-sztuki').removeAttr('disabled'); // Activate the "sztuki" <option>
		}
		$jednostka.find('.option-gramy').removeAttr('disabled');

		// Check what is the primary unit of the product & act accordingly
		if (unit === 'Gramy') {

			// Select "gramy" in "Jednostka" <select> element
			$jednostka.val('gramy');
			// Fill in 'ilosc' with 100
			$ilosc.val(100);

			// Fill in all the other input fields with the values from the product_info
			var kCal = Number(product.kCal).toFixed(0);
			var tluszcze = Number(product.Tluszcze).toFixed(0);
			var weglowodany = Number(product.Weglowodany).toFixed(0);
			var bialko = Number(product.Bialko).toFixed(0);

			fill_values_potrawa($row, kCal, tluszcze, weglowodany, bialko);

		} else if (unit === 'Sztuki') { // If the primary unit is "Sztuki"
			// Select "sztuki" in "Jednostka" <select> element
			$jednostka.val('sztuki');

			// Fill in 'ilsoc' with 1
			$ilosc.val(1);

			// Fill in all the other input fields with the values from the product_info
			var kCal = Number((product.kCal/100)*product.size).toFixed(0);
			var tluszcze = Number((product.Tluszcze/100)*product.size).toFixed(0);
			var weglowodany = Number((product.Weglowodany/100)*product.size).toFixed(0);
			var bialko = Number((product.Bialko/100)*product.size).toFixed(0);

			fill_values_potrawa($row, kCal, tluszcze, weglowodany, bialko);

		} // End of if(unit) statement

	} // End of fill_product() function


	function fill_values_potrawa($row, kCal, tluszcze, weglowodany, bialko) {
		// Get the input fields
		var $inputKCal = $row.find('.kCal');
		var $inputTluszcze = $row.find('.tluszcze');
		var $inputWeglowodany = $row.find('.weglowodany');
		var $inputBialko = $row.find('.bialko');

		$inputKCal.text(kCal);
		$inputTluszcze.text(tluszcze);
		$inputWeglowodany.text(weglowodany);
		$inputBialko.text(bialko);
	} // End of fill_values function
	
	/* This block of code defines the function that will sum the whole "posiłek" and will be used whenever a new product/potrawa is added or "ilosc" adjusted */
	function sum_nowa_potrawa() {
		// Define the varaibles that will hold the values to be summed
		var kCal = 0;
		var tluszcze = 0;
		var weglowodany = 0;
		var bialko = 0;

		// Get the row of "podsumowanie"
		var $potrawa = $('tbody.nowa-potrawa tr.potrawa');
		// Get all the <td>s of products in "posiłek" with the respective numbers in them
		var $tdKCal =$('tbody.nowa-potrawa tr.skladnik').find('.kCal');
		var $tdTluszcze = $('tbody.nowa-potrawa tr.skladnik').find('.tluszcze');
		var $tdWeglowodany = $('tbody.nowa-potrawa tr.skladnik').find('.weglowodany');
		var $tdBialko = $('tbody.nowa-potrawa tr.skladnik').find('.bialko');

		$tdKCal.each(function(){
			$this = $(this);
			kCal += Number($this.text());
		});
		$tdTluszcze.each(function() {
			$this = $(this);
			tluszcze += Number($this.text());
		})
		$tdWeglowodany.each(function() {
			$this = $(this);
			weglowodany += Number($this.text());
		})
		$tdBialko.each(function() {
			$this = $(this);
			bialko += Number($this.text());
		})
		$potrawa.find('.kCal').text(kCal);
		$potrawa.find('.tluszcze').text(tluszcze);
		$potrawa.find('.weglowodany').text(weglowodany);
		$potrawa.find('.bialko').text(bialko);

	} // End of sum_posilek() function definition

	// Define the function to create product list
	function product_list_potrawa(products, $field) {
		$field.html('<option selected disabled>Wybierz...</option>');
		var prodList = ''; // Define the variable that will contain HTML markup with <options>
		products.forEach(function(product) {
			prodList += '<option value="' + product.P_Id + '">' + product.P_nazwa + '</option>';
		});
		$field.append(prodList);
	} // End of product_list() function definition
});
