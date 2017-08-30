$(function() {

	var loginErrorMessage = null;
	var $loginForm = $('#login-form');
	var $errorSpan = $('span.error');

	$loginForm.on('submit', function(e) {
		e.preventDefault();
		var username = $('#login-form :input[name=username]').val();
		var password = $('#login-form :input[name=password]').val();
		
		if (verifyInputProvided(username, password) == false) {
			$errorSpan.removeClass('hidden');
			$errorSpan.text('Wprowadź swój login i hasło');
			return false;
		}

		var dataString = 'username='+username+'&password='+password;
		var $this = e.target;
		$.ajax({
			type: "POST",
			url: "login/run",
			data: dataString,
			success: function(response) {
				if (response === 'login') {
					window.location.replace('dziennik');
				} else {
					loginErrorMessage = 'Login lub hasło są błędne';
					$errorSpan.removeClass('hidden').text(loginErrorMessage);
				}
			}
		});
	 });

	function verifyInputProvided(username, password) {
		if (username == '' || password == '') {		
			return false;
		}
	}
});