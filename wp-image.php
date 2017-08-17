<?php
/*
Plugin Name: WP Image
Description: Better image management for WordPress.
Version: 1.0.0
Author: Junaid Bhura
Author URI: https://junaidbhura.com
Text Domain: wp-image
*/

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

/**
 * Overrides IMG tag with a shortcode.
 *
 * @param string       $html    The image HTML markup to send.
 * @param int          $id      The attachment id.
 * @param string       $caption The image caption.
 * @param string       $title   The image title.
 * @param string       $align   The image alignment.
 * @param string       $url     The image source URL.
 * @param string|array $size    Size of image. Image size or array of width and height values
 *                              (in that order). Default 'medium'.
 * @param string       $alt     The image alternative, or alt, text.
 */
function wp_image_send_to_editor( $html, $id, $caption, $title, $align, $url, $size, $alt ) {
	return '[wp_image id="' . $id .
		'" src="' . wp_get_attachment_url( $id ) .
		'" size="' . $size .
		'" alt="' . $alt .
		'" title="' . $title .
		'" caption="' . $caption .
		'" align="' . $align .
		'" url="' . $url . '"]';
}
add_filter( 'image_send_to_editor', 'wp_image_send_to_editor', 10, 8 );

/**
 * Adds custom external TinyMCE plugin.
 *
 * @param array $external_plugins An array of external TinyMCE plugins.
 */
function wp_image_mce_external_plugins( $external_plugins ) {
	return array_merge(
		array(
			'wp_image' => plugins_url( 'js/wp-image.js', __FILE__ ),
		),
		$external_plugins
	);
}
add_filter( 'mce_external_plugins', 'wp_image_mce_external_plugins' );

/**
 * Adds a 'wp_image' shortcode.
 *
 * @param array $atts An array of attributes sent to this shortcode.
 */
function wp_image_shortcode_wp_image( $atts ) {
	$atts = wp_parse_args( $atts, array(
		'id'      => 0,
		'src'     => '',
		'size'    => 'thumbnail',
		'alt'     => '',
		'title'   => '',
		'caption' => '',
		'align'   => 'none',
		'url'     => '',
	) );

	/**
	 * Filters the image's atts before generating the HTML.
	 *
	 * @param $atts Array of attributes.
	 */
	$atts = apply_filters( 'wp_image_atts', $atts );

	/**
	 * Filters the image's HTML attributes.
	 *
	 * @param $atts Array of attributes.
	 */
	$img_atts = apply_filters( 'wp_image_img_attributes', array(
		'alt'   => $atts['alt'],
		'title' => $atts['title'],
	) );

	$image = wp_get_attachment_image( $atts['id'], $atts['size'], false, $img_atts );

	/**
	 * Filters the image HTML tag in the theme.
	 *
	 * @param string $html The image HTML markup to send.
	 * @param array  $atts The attachment id.
	 */
	return apply_filters( 'wp_image', $image, $atts );
}
add_shortcode( 'wp_image', 'wp_image_shortcode_wp_image' );
