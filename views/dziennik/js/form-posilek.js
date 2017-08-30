$(function() {
	var $dodajPosilek = $('#dodaj-posilek'); // Get the "dodaj posiłek" button
	$dodajPosilek.on('click', function() { // Add the event handler
		var $formTable = $('table.posilek'); // Get the whole form of "posiłek"
		$formTable.find('tr.podsumowanie td.number').text(''); // Clear the "podsumowanie" row
		$formTable.removeClass('hidden'); // Unhide the form

	});

	/* This block of code will handle the submit event */

	var $submitButton = $('#submit'); // Get the submit button
	$submitButton.on('click', function(e) { // Add an event handler
		e.preventDefault(); // Stop the form from submitting

		// Define an Product object
		function Product(product_id, potrawa_id, jednostka, ilosc, kCal, tluszcze, weglowodany, bialko) {
			this.product_id = product_id;
			this.potrawa_id = potrawa_id
			this.jednostka = jednostka;
			this.ilosc = ilosc;
			this.kCal = kCal;
			this.tluszcze = tluszcze;
			this.weglowodany = weglowodany;
			this.bialko = bialko;
		}

		// Get all the product data
		var prodData = []; // Define the array that will hold all the product information
		var $prodTr = $('tr.prod'); // Get all the rows with product information

		$prodTr.each(function($row) { // Loop through all the rows & collect the informations
			var $this = $(this);
			if ($this.hasClass('input')) {
				var $selectElement = $this.find('.wybor');
				var product_id = $selectElement.val();
				var potrawa_id = null;
				var jednostka = $this.find('.jednostka').val().toLowerCase();
			} else {
				var $tdElement = $this.find('td.produkt');
				var product_id = $tdElement.attr('data-product_id');
				var potrawa_id = $tdElement.prev().attr('data-potrawa_id');
				var jednostka = $this.find('.jednostka').text().toLowerCase();
			}

			
			var ilosc = Number($this.find('.ilosc').val());
			var kCal = Number($this.find('.kCal').text());
			var tluszcze = Number($this.find('.tluszcze').text());
			var weglowodany = Number($this.find('.weglowodany').text());
			var bialko = Number($this.find('.bialko').text());
			var product = new Product(product_id, potrawa_id, jednostka, ilosc, kCal, tluszcze, weglowodany, bialko);
			prodData.push(product);
		});

		var ajaxData = JSON.stringify(prodData);
		var url = 'ajax/save_posilek.php';

		$.ajax({
			type: 'POST',
			url: url,
			data: ajaxData,
			contentType: 'application/json',
			success: function() {
				get_day();
				clear_form();
			}

		});
		
		
		function fill_result(kCal, t, w, b) {
			var $resultKCal = $('#result-kcal'); // Get the <td> element from the result table responsible for kCal
			var $resultTluszcze = $('#result-t'); // Get the one for tluszcze
			var $resultWeglowodany = $('#result-w'); // Get the one for weglowodany
			var $resultBialko = $('#result-b'); // Get the one for bialko

			$resultKCal.text(kCal); // Fill it with the sum of the day's kCal
			$resultTluszcze.text(t);
			$resultWeglowodany.text(w);
			$resultBialko.text(b);
		}

		function clear_form() {
			var $notInputRows = $('tr.prod:not(.input)'); // Get all rows with "prod" class, except "input" rows
			$notInputRows.remove(); // Remove them
			var $inputRows = $('tr.input:gt(0)'); // Get all input rows
			$inputRows.remove(); // Remove them
			var $inputRow = $('tr.input'); // Get the last row
			$inputRow.removeAttr('data-potrawa_id'); // Clear potrawa_id attribute
			$inputRow.removeClass('prod'); // Remove attribute "prod" that says that this row contains a product
			$inputRow.find('.pp').html('<option selected disabled>Produkt czy potrawa</option><option value="potrawa">Potrawa</option><option value="produkt">Produkt</option>');
			$inputRow.find('.wybor').children(':gt(0)').remove(); // Remove all the products from the list
			$inputRow.find('.option-sztuki').attr('disabled', 'disabled'); // Disable "sztuki" jednostka
			$inputRow.find('.option-gramy').attr('disabled', 'disabled'); // Disable "gramy" jednostka
			$inputRow.find('.jednostka').removeClass('hidden'); // Remove the "hidden" class if there was one on 'jednostka'
			$inputRow.find('.ilosc').val('').removeClass('hidden'); // Clear value of "ilość" & remove "hidden" class if there was one
			$inputRow.find('.kCal').text(''); // Clear value of kCal
			$inputRow.find('.tluszcze').text(''); // Clear value of kCal
			$inputRow.find('.weglowodany').text(''); // Clear value of kCal
			$inputRow.find('.bialko').text(''); // Clear value of kCal
			$inputRow.find('.potrawa-zwin').text('Zwiń').addClass('hidden'); // Hide & fix text of the "zwin" button
			$('table.posilek').addClass('hidden');
		}

	})
});
