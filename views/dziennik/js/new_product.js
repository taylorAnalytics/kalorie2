/**
 * The purpose of this script is to manage the new product functionality
 *
 * The script will:
 * - add event listener to nowy-produkt button that will show it (remove hidden class)
 * - conduct input validation to each field after it's been blurred
 * - add event listener to "usun" button that will clear all the input & hide the whole form
 * - add event listener to "zapisz" button that will save the product in the database through AJAX & also clear & hide the form
 * - add event listener to "zapisz i dodaj" button that will do the same as "zapisz" button, but also will add the product to the posiłek
 *
 */

$(function() {
	// Define the product class
	var product = {
		name: "",
		unit: "",
		size: 0,
		kCal: 0,
		tluszcze: 0,
		weglowodany: 0,
		bialko: 0
	}

	// Create an event handler for "nowy-produkt" button
	var $newProduct = $('#nowy-produkt'); // Get the button & save it in a variable
	$newProduct.on('click', function() { // Add an event listener
		var $productForm = $('table.nowy-produkt'); // Get the table with the input elements
		$productForm.removeClass('hidden');
	})

	// Create an event handler for "jednostka" select field to toggle the display of the "gram_szt" input field
	var $jednostkaSelect = $('tbody.nowy-produkt select.jednostka'); // Get the "jednostka" select field
	var $sztGrInput = $('tbody.nowy-produkt input[name=gram_szt]'); // Get the "gram_szt" input field
	var $sztGrHeader = $('#gram_szt_header'); // Get the header of the column that holds the input field
	$jednostkaSelect.on('change', function() { // Add an event handler
		var jednostka = $jednostkaSelect.val(); // Get the value of the select field
		if (jednostka === 'sztuki') { // If the selected "jednostka" is sztuki
			$sztGrInput.removeClass('hidden'); // Unhide the input field
			$sztGrHeader.removeClass('hidden'); // Unhide the header
		} else { // Otherwise
			$sztGrInput.addClass('hidden'); // Hide the input field
			$sztGrHeader.addClass('hidden'); // Hide the header
			$sztGrInput.val(''); // Set the value of the field to 0
		}
	});
	// Run input validation
	var $numbersInput = $('table.nowy-produkt input.number'); // Get all the number input fields & store them in a varible
	var $textInput = $('table.nowy-produkt input.text'); // Get the text input field - the name of the new produkt
	$numbersInput.on('blur', function() { // Add an event listener to each of number input fields that fires on blur
		validate_fields($textInput, $numbersInput);
	});
	$textInput.on('blur', function() {
		validate_fields($textInput, $numbersInput);
	});
	
	// Create an event hadler for "usun" button
	var $usunButton = $('table.nowy-produkt button.usun');
	$usunButton.on('click', reset_hide);

	// Create an event handler for "zapisz" button
	var $zapiszButton = $('table.nowy-produkt button.zapisz');
	$zapiszButton.on('click', function() { // Add an event handler
		if (validate_fields($textInput, $numbersInput)) { // Validate the fields
			save_product(); // Run the save_product function
		}
		
	});

	// Define the reset_hide() function to reset the form & hide it
	function reset_hide() {
		var $form = $('form.form-nowy-produkt'); // Get the form for the new product & store it in a variable
		$form.trigger("reset");
		$('table.nowy-produkt').addClass('hidden');
		$sztGrInput.addClass('hidden'); // Hide the input field
		$sztGrHeader.addClass('hidden'); // Hide the header
		$sztGrInput.val(''); // Set the value of the field to 0

		var $errorFields = $('tbody.nowy-produkt td.error'); // Get all the error fields
		$errorFields.addClass('hidden'); // Hide them all
	}

	// Define the function that will check if all the product fields are validated
	function validate_fields($tInput, $nInput) {
		var textValidated = true; // A flag variable to check if the text input has been validated
		var numbersValidated = true; // A flag variable to check if the number inputs have been validated
		var $textErrorField = $('tbody.nowy-produkt').find('.text-input-error'); // Get the <td> with the error message for text input
		var $numbersErrorField = $('tbody.nowy-produkt').find('.number-input-error'); // Get the <td> with the error message for number input
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

	// Define the function that will save the product in MySQL database through AJAX request
	function save_product() {
		// Fill product properties with the field values
		product.name = $textInput.val(); // Get the name of the product
		var $tbody = $('tbody.nowy-produkt'); // Get the tbody that contains all the elements
		product.unit = $tbody.find('select[name=jednostka]').val(); // Get the primary unit of the product
		product.size = $tbody.find('input[name=gram_szt]').val(); // Get the size of the "sztuka" if there is one
		product.kCal = $tbody.find('input[name=kCal]').val(); // Get the kCal value
		product.tluszcze = $tbody.find('input[name=tluszcze]').val(); // Get the tluszcze value
		product.weglowodany = $tbody.find('input[name=weglowodany]').val(); // Gert the weglowodany value
		product.bialko = $tbody.find('input[name=bialko]').val(); // Get the bialko value

		var $allFilledError = $tbody.find('.allFilled-error'); // Get the <td> with the error message if not all fields have been filled
		var $saveError = $tbody.find('.save-error'); // Get the <td> that will hold the save error message in case it appears
		// Check if all fields have been filled (including the conditional on the "jednostka" field)
		var allFilled = true; // Create a flag variable that will check if all fields have been filled
		if (product.name === '') { // Product name is empty
			allFilled = false; // Change the flag into false
		}

		if (product.unit === 'sztuki') { // If the selected "jednostka" was "sztuki"
			if (product.size === '' || product.size == 0) { // There is no product size inputted
				allFilled = false; // Change the flag into false
			}
		}
		if (product.kCal === '' || product.kCal == 0) { // There is no kCal inputted
			allFilled = false;
		}
		if (product.tluszcze === '') { // There is no tluszcze
			allFilled = false;
		}
		if (product.weglowodany === '') { // There is no weglowodany
			allFilled = false;
		}
		if (product.bialko === '') { // There is no bialko
			allFilled = false;
		}

		// Check if all have been validated & if so, then do the ajax request. If not, show a message
		if (allFilled) { // It is true, all fields are filled
			
			$allFilledError.addClass('hidden'); // Add hidden class to the error message (in case it has been removed)
			$saveError.text(''); // Clear the error message
			$saveError.addClass('hidden'); // Hide the error message
			// Prepare the AJAX data & request 
			var productData = JSON.stringify(product); // Stringify the product object
			var url = 'ajax/new_product.php';
			$.ajax({
				type: "POST",
				url: url,
				data: productData,
				contentType: 'application/json',
				success: function(response) {
					if (response==true) { // If the save was succesfull
						reset_hide(); // Reset the form & hide it
					} else { // Otherwise
						$saveError.text(response); // Add error text to the error <td> element
						$saveError.removeClass('hidden'); // Unhide the error <td> element
					}
					
				}
			});
		} else { // Not all have been filled
			$allFilledError.removeClass('hidden');
		}
		
	}

});