/**
 * The purpose of this script is to handle the display of meals eaten during the day
 *
 * The script will:
 * - create an event listener to the "posilki-lista" button that will trigger the display of the list
 * - define the function that will get the data about the meals from PHP, handle the data & create <tr>s that will display the data
 * - create an event listener that will change the text in the button between "Pokaź" & "Schowaj"
 *
 */

$(function() {

	var $listButton = $('#posilki-lista'); // Get the button triggering the display of the list & store it in a variable

	$listButton.on('click', function() { // Add an event listener
		get_list(); // Run the function to get the list of the products

	});

	function get_list() {
		var url = 'ajax/get_list.php'; // Define the url that will handle AJAX request
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			success: function(response) {
				var noOfPosilki = 0; // Define the variable that will count the number of meals returned from AJAX
				response.forEach(function(posilekObject) {
					if (posilekObject.Posilek_nr > noOfPosilki) { // If the checked Posilek_no is higher than the max already counted, than make it the max
						noOfPosilki = posilekObject.Posilek_nr;
					}
				});
				
				
				var posilki = new Array(); // Define the array that will hold meals detailed information
				for (var i = 0; i < noOfPosilki; i++) { // Repeat as many times as many meals there are in the data
					// Define the Posilek class
					var Posilek = {
						Posilek_nr: i+1,
						kCal: 0,
						Tluszcze: 0,
						Weglowodany: 0,
						Bialko: 0
					}
					posilki.push(Posilek);
				}

				posilki.forEach(function(posilek) {
					response.forEach(function(posilekObject) {
						if (posilek.Posilek_nr == posilekObject.Posilek_nr) { // The line from the posilekObject corresponds to the Posilek_nr of the array element
							posilek.kCal += Number(posilekObject.kCal);
							posilek.Tluszcze += Number(posilekObject.Tluszcze);
							posilek.Weglowodany += Number(posilekObject.Weglowodany);
							posilek.Bialko += Number(posilekObject.Bialko);
						}
					});
				});

				console.log(posilki);
			}
		});
	}
});