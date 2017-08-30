<div class="login">
	<span class="error hidden"></span>
	<form action="<?php echo URL; ?>login/run" method="post" id="login-form">
		<label for="username">Login</label><br />
		<input type="text" name="username" size="20" /><br />
		<label for="password">Hasło</label><br />
		<input type="password" name="password" size="20" /><br />
		<input type="submit" name="submitButton" value="Zaloguj" />
	</form>
</div>
