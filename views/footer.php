<div id="footer">
</div>

<script type="text/javascript" src="public/js/jquery.js"></script>
<?php
if (isset($this->js)) {
	foreach ($this->js as $jsFile) {
		echo '<script type="text/javascript" src="' . URL . 'views/' . $jsFile . '"></script>';
	}
}
?>
</body>
</html>
