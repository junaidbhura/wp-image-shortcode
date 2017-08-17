/**
 * WP Image TinyMCE Plugin
 */

tinymce.PluginManager.add( 'wp_image', function( editor ) {

	/**
	 * Stores all replaced shortcodes.
	 *
	 * @type {array}
	 */
	var replacedShortcodes = [];

	/**
	 * Replaces the shortcode with an IMG tag.
	 *
	 * @param  {string} content
	 * @return {string}
	 */
	function replaceWPImageShortcodes( content ) {
		// Look for shortcodes
		return content.replace( /\[wp_image([^\]]*)\]/g, function( match ) {
			// Replace shortcode with IMG
			return wp.shortcode.replace( 'wp_image', match, function( arguments ) {
				// First save the shortcode
				replacedShortcodes[ arguments.attrs.named.id ] = match;

				// Prepare classes
				var classes = [ 'align' + arguments.attrs.named.align.replace( 'align', '' ) ];
				classes.push( 'size-' + arguments.attrs.named.size );
				classes.push( 'wp-image-' + arguments.attrs.named.id );
				classes.push( arguments.attrs.named.class );

				// Return IMG tag
				return wp.html.string({
					tag: 'img',
					attrs: {
						'data-wp-img-id': arguments.attrs.named.id,
						'src': arguments.attrs.named.src,
						'class': classes.join( ' ' ),
						'alt': arguments.attrs.named.alt,
						'title': arguments.attrs.named.title
					}
				});
			});
		});
	}

	/**
	 * Gets an image ID from the IMG tag.
	 *
	 * @param  {string}    image
	 * @return {int|false}
	 */
	function getImageId( image ) {
		var matches = image.match( /data-wp-img-id="(.*?)"/ );
		if ( 2 === matches.length ) {
			return parseInt( matches[1] );
		}
		return false;
	}

	/**
	 * Replaced the IMG tags with their corresponding shortcodes.
	 *
	 * @param  {string} content
	 * @return {string}
	 */
	function restoreWPImageShortcodes( content ) {
		// Look for images
		return content.replace( /<img.*?data-wp-img-id="(.*?)"[^\>]+>/g, function( match ) {
			// Look for a shortcode with matching ID
			var id = getImageId( match );
			if ( false !== id && id in replacedShortcodes ) {
				// Shortcode found, replace it
				return replacedShortcodes[ id ];
			} else {
				// Shortcode not found, do not replace it
				return match;
			}
		});
	}

	/**
	 * Updates a shortcode from data in the IMG tag.
	 *
	 * @param  {string} image
	 * @return {void}
	 */
	function updateShortcodeFromImage( image ) {
		// Find the shortcode for this image
		var id = getImageId( image );
		if ( false !== id && id in replacedShortcodes ) {
			// Prepare image
			var img = $( image );

			// ALT
			replacedShortcodes[ id ] = replacedShortcodes[ id ].replace( /src="(.*?)"/g, function( match ) {
				return 'src="' + img.attr( 'src' )  + '"';
			});

			// Alignment
			var align = 'align="none"';
			if ( img.is( '.alignleft' ) ) {
				align = 'align="left"';
			} else if ( img.is( '.alignright' ) ) {
				align = 'align="right"';
			} else if ( img.is( '.aligncenter' ) ) {
				align = 'align="center"';
			}
			replacedShortcodes[ id ] = replacedShortcodes[ id ].replace( /align="(.*?)"/g, function( match ) {
				return align;
			});

			// ALT
			replacedShortcodes[ id ] = replacedShortcodes[ id ].replace( /alt="(.*?)"/g, function( match ) {
				return 'alt="' + img.attr( 'alt' )  + '"';
			});

			// Title
			replacedShortcodes[ id ] = replacedShortcodes[ id ].replace( /title="(.*?)"/g, function( match ) {
				return 'title="' + img.attr( 'title' )  + '"';
			});

			// Class
			replacedShortcodes[ id ] = replacedShortcodes[ id ].replace( /class="(.*?)"/g, function( match ) {
				var classAttr = img.attr( 'class' );
				classAttr = classAttr
					.replace( 'alignleft', '' )
					.replace( 'alignright', '' )
					.replace( 'aligncenter', '' )
					.replace( 'alignnone', '' );
				return 'class="' + classAttr.trim() + '"';
			});
		}
	}

	/**
	 * BeforeSetContent Event: Updates all shortcodes with IMG tags.
	 *
	 * @param  {object} event
	 */
	editor.on( 'BeforeSetContent', function( event ) {
		event.content = replaceWPImageShortcodes( event.content );
	});

	/**
	 * PostProcess Event: Updates all IMG tags back to shortcodes.
	 *
	 * @param  {object} event
	 */
	editor.on( 'PostProcess', function( event ) {
		if ( event.get ) {
			event.content = restoreWPImageShortcodes( event.content );
		}
	});

	/**
	 * When an IMG is updated in TinyMCE, make sure to update it's
	 * corresponding shortcode as well, so it gets saved correctly.
	 *
	 * BeforeExecCommand fires when the image's alignment is changed.
	 * editor:image-update and editor:image-edit fire when the image is edited.
	 */
	editor.on( 'BeforeExecCommand', function( event ) {
		node = editor.selection.getNode();
		if ( node.nodeName !== 'IMG' ) {
			return;
		}
		updateShortcodeFromImage( node.outerHTML );
	});

	if ( wp.media.events ) {
		wp.media.events.on( 'editor:image-update editor:image-edit', function( data ) {
			updateShortcodeFromImage( data.image.outerHTML );
		});
	}

});
