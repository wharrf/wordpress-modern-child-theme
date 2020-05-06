<?php

//	Include Libraries Here
include __DIR__.'/lib/core/core.php';

//	Declare Classes Here
$Core = New Core;

//	Add Hooks Here
add_action( 'wp_enqueue_scripts', function () use ($Core) {
	$Core->enqueue_scripts();
	$Core->enqueue_styles();
} );