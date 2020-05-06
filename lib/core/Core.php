<?php

class Core {
	private $is_production = false;

	public function __construct () {
		$this->define_wp_env();

		if (WP_ENV === 'production') {
			$this->is_production = true;
		}
	}

	private function define_wp_env () {
		if (!defined('WP_ENV')) {
			define('WP_ENV', 'unknown');
		}
	}

	public function enqueue_scripts () {
		wp_enqueue_script(
			'child-script',
			get_stylesheet_directory_uri() . '/dist/main.js',
			['jquery'],
			$this->is_production ? date() : time(),
			false
		);
	}

	public function enqueue_styles () {
		wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
		wp_enqueue_style( 'child-style',
			get_stylesheet_directory_uri() . '/dist/main.css',
			['parent-style']
		);
	}
}