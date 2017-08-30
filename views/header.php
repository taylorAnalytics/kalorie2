<!doctype html>
<html lang="en">
<head>
	<title><?php echo (isset($this->title) ? $this->title : 'Kalorie'); ?> </title>
	<link rel="stylesheet" href="<?php echo URL; ?>public/css/style.css" />

</head>

<div id="header">
	<h1>Licz kalorie i chudnij!</h1>
</div>


<?php Session::init(); ?>
<?php if (Session::get('loggedIn') == true): ?>
<div class="top-nav">
	<nav class="header">
		<ul class="nav">
			<li class="nav-item"><a class="nav-link" href="dziennik">Dziennik kalorii</a></li>
			<li class="nav-item"><a class="nav-link" href="treningi">Treningi</a></li>
			<li class="nav-item"><a class="nav-link" href="historia">Historia</a></li>
			<li class="nav-item"><a class="nav-link" href="cele">Cele</a></li>
			<li class="nav-item"><a class="nav-link" href="logout">Wyloguj</a></li>
		</ul>
	</nav>
</div>
<div class="clear"></div>
<?php endif; ?>


<body>
