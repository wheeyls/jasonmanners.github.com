<?php
$myFile = "test.html";
$fh = fopen($myFile, 'w') or die("can't open file");
$stringData = "<html><body>Hello, Dave!</body></html>";
fwrite($fh, $stringData);
fclose($fh);
?>
<html>
<body>
writing...
</body>
</htm>