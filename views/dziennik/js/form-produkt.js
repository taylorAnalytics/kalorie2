/**
 * The purspose of this script is to ensure the functionality of the posilek form
 *
 * The script will:
 * - listen to the selection of produkt vs potrawa
 * - get the list of products or potrawy & add it to the proper select element
 * - listen to the change of the select element
 * - If produkt selected it will get all the product info from backend (product_id, sztuki/gram, primary jednostka,
 * kCal, T, W, B)
 * - it will fill in the form fields with product_info data (does it need to be stored somehow? local storage or session?)
 *
 */

$(function() {

	var $pps = $('.pp'); // Get all the select items of pp class

	/* This block of code will listen to the change event on <select pp> element & will create & append a product list based on the AJAX request */

	$pps.on('change', function(e) { // Add an event listener with event object (on ('change'))
		var $changedPp = $(e.target); 	// Get the target of the change event
		var $trParent = $changedPp.parent().parent(); // Get the parent of the <select pp> element
		var $prodSelect = $trParent.find('.wybor'); // Get the <select> element for Produkt
		var $value = $changedPp.val();
		var url = '';

		if ($value === 'produkt') { // If a product was selected
			// Remove 'potrawa' class & add 'produkt' class 
			$prodSelect.removeClass('potrawa').addClass('produkt');
			// Define the url
			url = 'dziennik/getProductList';
		} else if ($value === 'potrawa') { // If a potrawa was selected
			// Clear all the values of a product if there was one
			clear_values($trParent);
			// Remove 'produkt' class & add 'potrawa' class 
			$prodSelect.removeClass('produkt').addClass('potrawa');
			// Define the url
			url = 'dziennik/getDishList';
		} // End of if(produkt) statement

		// Define the ajax
		$.ajax ({
			type: "GET",
			url: url,
			success: function(data) {
				var products = JSON.parse(data);
				product_list(products, $prodSelect);

			}
		}); // End of AJAX request

		// Define the function to create product list
		function product_list(products, $field) {
			$field.html('<option selected disabled>Wybierz...</option>');
			var prodList = ''; // Define the variable that will contain HTML markup with <options>
			products.forEach(function(product) {
				prodList += '<option value="' + product.P_Id + '">' + product.P_nazwa + '</option>';
			});
			$field.append(prodList);
		} // End of product_list() function definition
	}); // End of event listener on <select pp>

	/* This block of code will listen to the change event on <select produkt> element & will get the information about the selected product & fill it into the rest of the table row */

	var $prodSelect = $('.wybor'); // Get all the Produkt <select> elements
	// Add an event listener to all produkt select lists
	$prodSelect.on('change', function(e) {
		var $changedProduct = $(e.target); // Get the target of the change event, the list that was actually changed
		var $trParent = $changedProduct.parent().parent(); // Get its parent
		var $jednostka = $trParent.find('.jednostka');

		var $pp = $trParent.find('.pp'); // Get its child, which is the <select pp> list that contains the infomation if this row in the form is responsible for a Produkt or Potrawa
		if ($pp.val() === 'produkt') { // If the value of the <select pp> element is 'produkt', only then do all the work
			$trParent.addClass('prod'); // Add a class defining that this row contains a "produkt"
			// Disable all the "jednostki"	
			$jednostka.find('.option-gramy').attr('disabled', 'disabled');
			$jednostka.find('.option-sztuki').attr('disabled', 'disabled');
			var product_id = $changedProduct.val(); // Get the product id from the <option> element. It will be used as an argument for the $.ajax call
			var url = 'dziennik/getProductSingle';
			var data = ({Produkt_Id: product_id});
			// Do the AJAX request
			$.ajax({
				type: "POST",
				data: data,
				dataType: 'json',
				url: url,
				success: function(response) {
					var product = response;
					fill_product(product, $trParent);
					sum_posilek();
				}

			});
		} else if ($pp.val() === 'potrawa') { // If the selected thing is actually potrawa
			$trParent.removeClass('prod'); // Remove 'prod' class if there was one
			// Clear a previous "potrawa"...?? how??
			$jednostka.addClass('hidden'); // Hide the "jednostka" element
			var $iloscInput = $trParent.find('.ilosc'); // Get the "ilość" input element
			$iloscInput.addClass('hidden'); // Hide it
			
			// Send the AJAX request to get the info about all the containing products
			// Prepare the input to the $.ajax
			var potrawa_id = $changedProduct.val();
			var url = 'dziennik/getDishSingle';
			var data = ({Potrawa_Id: potrawa_id});
			// Do the $.ajax request
			$.ajax({
				type: "POST",
				data: data,
				dataType: 'json',
				url: url,
				success: function(response) {
					var potrawa = new Array();
					if (response[0] === undefined) {
						potrawa[0] = response;
					} else {
						potrawa = response;
					}
					fill_potrawa(potrawa, $trParent);
					sum_potrawa(potrawa[0].Potrawa_Id, $trParent);
					sum_posilek();
				}
			});

			
			// Add an event listener to all the "ilość" elements that will update the sum in "potrawa" once something changes


		}

		// Define the function that will fill in product values & store product info
		function fill_product(product, $row) {
			
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

				fill_values($row, kCal, tluszcze, weglowodany, bialko);

			} else if (unit === 'Sztuki') { // If the primary unit is "Sztuki"
				// Select "sztuki" in "Jednostka" <select> element
				$jednostka.val('sztuki');

				// Fill in 'ilsoc' with 1
				$ilosc.val(1);

				/// Fill in all the other input fields with the values from the product_info
				var kCal = Number((product.kCal/100)*product.size).toFixed(0);
				var tluszcze = Number((product.Tluszcze/100)*product.size).toFixed(0);
				var weglowodany = Number((product.Weglowodany/100)*product.size).toFixed(0);
				var bialko = Number((product.Bialko/100)*product.size).toFixed(0);

				fill_values($row, kCal, tluszcze, weglowodany, bialko);

			} // End of if(unit) statement

		} // End of fill_product() function


		function fill_potrawa(potrawa, $row) {
			var $tbody = $('tbody.posilek');
			// Clear all previous "potrawa" rows & information
			var previousPotrawaId = $row.attr('data-potrawa_id'); // Get the PotrawaId of the previous potrawa
			if (previousPotrawaId) { // If there was a potrawa selected previously there
				var $tdEls = $("td[data-potrawa_id='" + previousPotrawaId + "']"); // Get all the <td>s with the data attribute of this potrawa_id
				$tdEls.each(function() {
					var $this = $(this); // Get the element
					var $thisParent = $this.parent(); // Get it's parent row
					$thisParent.remove();
				})
			}

			// Find the "potrawa-zwin" button in this row & unhide it
			var $zwinButton = $row.find('.potrawa-zwin'); // Get the button in the row
			$zwinButton.removeClass('hidden'); // Remove 'hidden' class to unhide it

			// Create a row with all the information about each "produkt" that is included in potrawa
			potrawa.forEach(function(skladnik) {
				var $newRow = $row.clone(true); // Add a new row for each product
				$newRow.addClass('prod'); // Add the 'prod' class that states that this row contains a "produkt"
				$newRow.removeClass('input'); // Remove the "input" class
				$newRow.find('.usun').addClass('hidden');
				var $ppParent = $newRow.find('.pp').parent();
				$ppParent.text(skladnik.Potrawa_nazwa); // Each row should remove the "pp" select & insert a text saying "Potrawa.nazwa"
				$ppParent.attr('data-potrawa_id', skladnik.Potrawa_Id); // Add Potrawa_Id to the <td> element for further identification
				var $produktParent = $newRow.find('.wybor').parent(); // Get the parent td of the "wybor" <select> element
				$produktParent.text(skladnik.Produkt_nazwa); // Replace the <select> element with simple text with produkt_nazwa 
				$produktParent.attr('data-product_id', skladnik.Produkt_Id);
				$produktParent.addClass('produkt');
				// Add a data attribute somewhere with potrawa_id
				$jednostkaParent = $newRow.find('.jednostka').parent(); // Get the parent <td> of the "jednostka" element
				$jednostkaParent.text(skladnik.Jednostka_nazwa); // Replace the <select> element with the text saying sztuki/gramy
				$jednostkaParent.addClass('jednostka');
				$iloscInput = $newRow.find('.ilosc'); // Get the ilosc input element
				$iloscInput.removeClass('hidden'); // Make it visible
				// Check if the ilosc in the potrawa_info is an integer & format accordingly
				var iloscVal = Number(skladnik.Ilosc); // Define the iloscVal variable to store "ilość"
				if (Number.isInteger(iloscVal)) { // It is an integer
					iloscVal = Number(iloscVal).toFixed(0);
				} else { // It's not an integer
					iloscVal = Number(iloscVal).toFixed(1); // Make it a one decimal place floating number
				}

				$iloscInput.val(iloscVal); // fill it with the Ilosc from potrawa_info

				// Calculate the values of all the elements
				if (skladnik.Jednostka_nazwa === 'Gramy') { // The "jednostka" for calculation is "gramy"
					var kCal = Number(skladnik.kCal / 100 * skladnik.Ilosc).toFixed(0);
					var tluszcze = Number(skladnik.Tluszcze / 100 * skladnik.Ilosc).toFixed(0);
					var weglowodany = Number(skladnik.Weglowodany / 100 * skladnik.Ilosc).toFixed(0);
					var bialko = Number(skladnik.Bialko / 100 * skladnik.Ilosc).toFixed(0);
				} else if (skladnik.Jednostka_nazwa === 'Sztuki') { // The "jednostka" is "sztuki"
					var kCal = Number(skladnik.kCal / 100 * skladnik.Ilosc * skladnik.size).toFixed(0);
					var tluszcze = Number(skladnik.Tluszcze / 100 * skladnik.Ilosc * skladnik.size).toFixed(0);
					var weglowodany = Number(skladnik.Weglowodany / 100 * skladnik.Ilosc * skladnik.size).toFixed(0);
					var bialko = Number(skladnik.Bialko / 100 * skladnik.Ilosc * skladnik.size).toFixed(0);
				}

				fill_values($newRow, kCal, tluszcze, weglowodany, bialko);
				// Leave all the other "value" elements, that should be responding to the changes in "ilość"
				// Sum up all the values & fill in the values in "potrawa" main row
				$newRow.find('.dodaj').hide();
				$newRow.find('.potrawa-zwin').addClass('hidden');// Add back 'hidden' class to hide the button in case it was unhidden
				$row.after($newRow);
			});
			$row.attr('data-potrawa_id', potrawa[0].Potrawa_Id); // Set the id of potrawa to the whole row with potrawa name
		} // End of fill_potrawa() function

		/* This block of code will listen to change event on the "Jednostka" <select> & adjust the numbers in input fields */

		var $selectJednostki = $('.jednostka'); // Get all the select fields with class "jednostka"
		// Add event listener
		$selectJednostki.on('change', function(e) {
			var $selectJednostka = $(e.target); // Get the target of the event
			var jednostka = $selectJednostka.val(); // Get the value of "jednostka" select element
			var $trParent = $selectJednostka.parent().parent(); // Get the row of the table, where the event happened
			var $inputIlosc = $trParent.find('.ilosc'); // Get the input element with class "ilosc"
			var $input = $inputIlosc.val();
			var $prodSelect = $trParent.find('.produkt'); // Get the product select element
			var product_id = $prodSelect.val(); // Get the value of the product id in this row of the table
			// Prepare the AJAX request
			var url = 'dziennik/getProductSingle';
			var data = ({Produkt_Id: product_id});
			// Do the AJAX request
			$.ajax({
				type: "POST",
				data: data,
				dataType: 'json',
				url: url,
				success: function(response) {
					var product = response;
					if (jednostka === 'sztuki' || jednostka === 'Sztuki') {
						var newInput = $input / product.size; // Recalculate the input & store it in newInput variable
						newInput = Number(newInput);
						if (!Number.isInteger(newInput)) { // If the calculation result is not integer
							newInput = Number(newInput).toFixed(1) // Make it a one decimal floating point number
						}
						$inputIlosc.val(newInput); // Fill the input field with the new value
					} else if (jednostka === 'gramy' || jednostka === 'Gramy') { // The "jednostka" was sztuki before
						var newInput = $input * product.size; // Recalculate the input & store it in newInput variable
						newInput = Number(newInput);
						if (!Number.isInteger(newInput)) { // If the calculation result is not integer
							newInput = Number(newInput).toFixed(0) // Make it an integer
						}
						$inputIlosc.val(newInput); // Fill the input field with the new value
					} // End of if (jednostka) statement
				} // End of success function
			}); // End of AJAX request
		}); // End of "jednostka" event listener

		/* This block of code will listen to the change/blur event on the iloscInput, adjust the other input figures & fill them in */

		var $inputIlosc = $('.ilosc'); // Get all the "ilość input elements"
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
			var url = 'dziennik/getProductSingle';
			var data = ({Produkt_Id: product_id});
			// Do the AJAX request
			$.ajax({
				type: "POST",
				data: data,
				dataType: 'json',
				url: url,
				success: function(response) {
					var product = response;
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
					fill_values($trParent, kCal, tluszcze, weglowodany, bialko);
					// Find the <td> element with the attribute data-potrawa_id
					var $tdEl = $trParent.find('[data-potrawa_id]'); // Get the <td> element that should have the data attribute
					potrawa_id = $tdEl.attr('data-potrawa_id'); // Read the value of the attribute=potrawa_id (if it has one)
					if (potrawa_id) { // If there was a value to the attribute
						$fatherRow = $("tr[data-potrawa_id='" + potrawa_id + "']");
						sum_potrawa(potrawa_id, $fatherRow);
					}
					sum_posilek();
				} // End of success function
			}); // End of AJAX request
			
			


		});

		function fill_values($row, kCal, tluszcze, weglowodany, bialko) {
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

		
	});


	function sum_potrawa(potrawa_id, $row) {
		// Get all the td elements that have <td> elements with data-potrawa_id of value potrawa_id
		$tdEl = $('tr').find("[data-potrawa_id='" + potrawa_id + "']");
		
		var potrawaKCal = 0;
		var potrawaTluszcze = 0;
		var potrawaWeglowodany = 0;
		var potrawaBialko = 0;
		
		$tdEl.each(function(){
			var $this = $(this).parent();
			potrawaKCal += Number($this.find('.kCal').text());
			potrawaTluszcze += Number($this.find('.tluszcze').text());
			potrawaWeglowodany += Number($this.find('.weglowodany').text());
			potrawaBialko += Number($this.find('.bialko').text());
		}); // End of looping through all td elements
		
		$row.find('.kCal').text(potrawaKCal);
		$row.find('.tluszcze').text(potrawaTluszcze);
		$row.find('.weglowodany').text(potrawaWeglowodany);
		$row.find('.bialko').text(potrawaBialko);
	}

	/* This block of code defines the function that will sum the whole "posiłek" and will be used whenever a new product/potrawa is added or "ilosc" adjusted */
	function sum_posilek() {
		// Define the varaibles that will hold the values to be summed
		var kCal = 0;
		var tluszcze = 0;
		var weglowodany = 0;
		var bialko = 0;

		// Get the row of "podsumowanie"
		var $podsumowanie = $('tr.podsumowanie');
		// Get all the <td>s of products in "posiłek" with the respective numbers in them
		var $tdKCal =$('tr.prod').find('.kCal');
		var $tdTluszcze = $('tr.prod').find('.tluszcze');
		var $tdWeglowodany = $('tr.prod').find('.weglowodany');
		var $tdBialko = $('tr.prod').find('.bialko');

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
		$podsumowanie.find('.kCal').text(kCal);
		$podsumowanie.find('.tluszcze').text(tluszcze);
		$podsumowanie.find('.weglowodany').text(weglowodany);
		$podsumowanie.find('.bialko').text(bialko);

	} // End of sum_posilek() function definition

	/* The next block of code adds an event listener to "usun" button & deletes the potrawa or produkt */
	var $usunButton = $('table.posilek button.usun'); // Get all the "usuń" buttons
	
	$usunButton.on('click', function(e) { // Add an event handler to them
		var $this = $(e.target); // Get the taget of the event - the one button that was clicked
		var $trParent = $this.parent().parent(); // Get the parent <tr> for that button
		var potrawa_id = $trParent.attr('data-potrawa_id');
		var $inputRows = $('tr.input');
		
		if (potrawa_id) {
			$tdElements = $("td[data-potrawa_id='" + potrawa_id + "']"); // Get all the <td> elements with the same potrawa_id as defined
			$tdElements.each(function() { // Loop through each element from the selection
				$this = $(this); // Get the single element
				$this.parent().remove();
			});
		}

		if ($inputRows.length > 1) { // There is more than one input row	
			$trParent.remove();
		} else { // There is only one input row
			$trParent.removeAttr('data-potrawa_id'); // Clear potrawa_id attribute
			$trParent.removeClass('prod'); // Remove attribute "prod" that says that this row contains a product
			$trParent.find('.pp').html('<option selected disabled>Produkt czy potrawa</option><option value="potrawa">Potrawa</option><option value="produkt">Produkt</option>');
			$trParent.find('.wybor').children(':gt(0)').remove(); // Remove all the products from the list
			$trParent.find('.option-sztuki').attr('disabled', 'disabled'); // Disable "sztuki" jednostka
			$trParent.find('.option-gramy').attr('disabled', 'disabled'); // Disable "gramy" jednostka
			$trParent.find('.jednostka').removeClass('hidden'); // Remove the "hidden" class if there was one on 'jednostka'
			$trParent.find('.ilosc').val('').removeClass('hidden'); // Clear value of "ilość" & remove "hidden" class if there was one
			$trParent.find('.kCal').text(''); // Clear value of kCal
			$trParent.find('.tluszcze').text(''); // Clear value of kCal
			$trParent.find('.weglowodany').text(''); // Clear value of kCal
			$trParent.find('.bialko').text(''); // Clear value of kCal
			$trParent.find('.potrawa-zwin').text('Zwiń').addClass('hidden'); // Hide & fix text of the "zwin" button
			$('table.posilek').addClass('hidden');
		}
		sum_posilek();
	}); // End of usunButton event handler

	/* This block of code will create the function that will hide the products creating the potrawa.
	It will be used inside the event handler of "potrawa-zwin" button */

	var $zwinButton = $('.potrawa-zwin'); // Get all the buttons with class "potrawa-zwin"
	$zwinButton.on('click', function(e) { // Create an event handler in case the user clicks one of the buttons
		var $this = $(e.target); // Get the target of the event
		var $trParent = $this.parent().parent(); // Get the parent row of the zwinButton
		var potrawa_id = $trParent.attr('data-potrawa_id'); // Get the potrawa_id attribute
		
		var $tdEl = $("td[data-potrawa_id='" + potrawa_id +"']"); // Get all the td elements with data attribute of this potrawa_id
		if ($this.text() === 'Zwiń') {
			$tdEl.each(function(){
				$tdEl.parent().addClass('hidden');
			});
			$this.text('Rozwiń');
		} else if ($this.text() === 'Rozwiń') {
			$tdEl.each(function(){
				$tdEl.parent().removeClass('hidden');
			});
			$this.text('Zwiń');
		}
		
	}); // End of zwinButton event handler

});

function clear_values($row) {
		// Disable all the "jednostki"
		var $jednostka = $row.find('.jednostka');
		var option = '<option selected disabled>Jednostka</option>';
		option += '<option value="sztuki" class="option-sztuki" disabled>Sztuki</option>';
		option += '<option value="gramy" class="option-gramy" disabled>Gramy</option>';
		$jednostka.html(option);

		// Get the input fields
		$inputIlosc = $row.find('.ilosc');
		$inputKCal = $row.find('.kCal');
		$inputTluszcze = $row.find('.tluszcze');
		$inputWeglowodany = $row.find('.weglowodany');
		$inputBialko = $row.find('.bialko');

		$inputIlosc.val('');
		$inputKCal.text('');
		$inputTluszcze.text('');
		$inputWeglowodany.text('');
		$inputBialko.text('');
	} // End of clear_values function