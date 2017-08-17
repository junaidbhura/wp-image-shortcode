tinymce.PluginManager.add( 'jb_wp_image', function( editor ) {
	var replacedShortcodes = [];

	function replaceWPImageShortcodes( content ) {
		return content.replace( /\[wp_image([^\]]*)\]/g, function( match ) {
			return wp.shortcode.replace( 'wp_image', match, function( arguments ) {
				replacedShortcodes[ arguments.attrs.named.id ] = match;
				return wp.html.string({
					tag: 'img',
					attrs: {
						'data-wp-img-id': arguments.attrs.named.id,
						'src': arguments.attrs.named.src,
						'class': 'wp-image align-' + arguments.attrs.named.align,
						'alt': arguments.attrs.named.alt,
						'title': arguments.attrs.named.title
					}
				});
			});
		});
	}

	function restoreWPImageShortcodes( content ) {
		return content.replace( /<img.*?data-wp-img-id="(.*?)"[^\>]+>/g, function( match ) {
			var id = match.match( /data-wp-img-id="(.*?)"/ )[1];
			if ( id in replacedShortcodes ) {
				return replacedShortcodes[ id ];
			} else {
				return '';
			}
		});
	}

	editor.on( 'BeforeSetContent', function( event ) {
		event.content = replaceWPImageShortcodes( event.content );
	});

	editor.on( 'PostProcess', function( event ) {
		if ( event.get ) {
			event.content = restoreWPImageShortcodes( event.content );
		}
	});
});
