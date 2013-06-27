/**
	Preprintologist

	Ed Baskerville
	The OpenPub Project

	Browser extension to show PDFs alongside PeerJ (and hopefully arXiv) metadata/discussion.
*/

function peerjSetup() {
	console.log('here');
	// Insert Show/Hide Button
	$('article > .article-meta > .article-authors').after(
		'<a id="togglePdfA" href="#" class="btn btn-primary">Show PDF</a>'
	);

	pdfUrl = $('a[title="View as PDF"]').attr('href');

	/*docUrl = document.URL.split('?')[0].split('#')[0];
	console.log('docUrl: ' + docUrl);
	pdfUrl = null;
	if(docUrl.charAt(docUrl.length - 1) == '/') {
		pdfUrl = docUrl.substring(0, docUrl.lastIndexOf("/") - 1) + '.pdf';
	}
	else {
		pdfUrl = docUrl + '.pdf';
	}*/

	// Create div to move article content into when PDF is shown
	$('body').append('<div id="outer"><div class="container"><div id="outerRow" class="row"></div></div></div>');
	$('#outer').hide();

	// Create PDF view, initially hidden
	$('body').append('<iframe frameborder="0" id="preprintPdf" src="' + pdfUrl + '"></iframe>');
	$('#preprintPdf').hide();

	// Create resizer, initially hidden
	$('body').append('<div id="resizer"></div>');
	$('#resizer').hide();

	// Construct manager
	window.preprintManager = {
		pdfShown: false,

		showPdf : function() {
			// Remove sidebars and footer
			$('#footer').css('display', 'none');
			$('.article-item-leftbar-wrap').css('display', 'none');
			$('.article-item-rightbar-wrap').css('display', 'none');

			$('#preprintPdf').show();
			$('#resizer').show();
			$('#togglePdfA').text('Hide PDF');

			this.pdfShown = true;

			$('#article-item-middle').appendTo($('#outerRow'));
			$('#outer').show();

			this.layout();
		},

		hidePdf : function() {
			// Restore sidebars and footer
			$('#footer').css('display', '');
			$('.article-item-leftbar-wrap').css('display', '');
			$('.article-item-rightbar-wrap').css('display', '');

			$('#preprintPdf').hide();
			$('#resizer').hide();
			$('#togglePdfA').text('Show PDF');

			$('.article-item-leftbar-wrap').after($('#article-item-middle'));
			$('#outer').hide();

			this.pdfShown = false;
		},

		togglePdf : function() {
			console.log("toggling pdf");
			if(this.pdfShown) {
				this.hidePdf();
			}
			else {
				this.showPdf();
			}
		},

		layout : function() {
			if(!this.pdfShown) {
				return;
			}

			navHeight = $('body .navbar').height();
			windowHeight = $(window).height();
			windowWidth = $(window).width();
			pdfWidth = $('#preprintPdf').width();

			// Adjust height based on navbar
			console.log('navHeight: ' + navHeight);
			$('#preprintPdf').css('top', '' + navHeight + 'px');
			$('#preprintPdf').height(windowHeight - navHeight);

			windowWidth = $(window).width();
			console.log('windowWidth: ' + windowWidth);
			resizerWidth = $('#resizer').width();
			console.log('resizerWidth: ' + resizerWidth);

			// Position resizer
			$('#resizer').css('left', '' + pdfWidth + 'px');

			// Position main content
			$('#outer').css('top', '' + navHeight + 'px');
			$('#outer').height(windowHeight - navHeight);
			$('#outer').css('left', '' + (pdfWidth + resizerWidth) + 'px');
			$('#outer').css('width', '' + (windowWidth - pdfWidth - resizerWidth) + 'px');
		}
	}; // end of PeerJ manager object definition
}

function arxivSetup() {
	var pdfUrl = null;
	$('#abs > .extra-services > .full-text > ul > li > a').each(function(index) {
		if($(this).text() == 'PDF') {
			pdfUrl = $(this).attr('href');
		}
	});

	if(pdfUrl == null) {
		return null;
	}

	// Insert Show PDF link
	$('.extra-services').prepend('<div class="full-text"><h2><a href="#" id="togglePdfA">Show PDF</a></h2></div>');

	// Put everything in body into an inner div
	$('body').prepend('<div id="outer" class="outerArxiv"></div>');
	$('#cu-identity').appendTo($('#outer'));
	$('#header').appendTo($('#outer'));
	$('#content').appendTo($('#outer'));
	$('#footer').appendTo($('#outer'));

	// Create PDF view, initially hidden
	$('body').append('<embed frameborder="0" id="preprintPdf" src="' + pdfUrl + '"></iframe>');
	$('#preprintPdf').hide();

	// Create resizer, initially hidden
	$('body').append('<div id="resizer"></div>');
	$('#resizer').hide();

	window.preprintManager = {
		pdfShown : false,
		resizing: false,

		showPdf : function() {
			this.pdfShown = true;
			$('#preprintPdf').show();
			$('#resizer').show();
			$('#togglePdfA').text('Hide PDF');

			this.layout();
		},

		hidePdf : function() {
			this.pdfShown = false;
			$('#preprintPdf').hide();
			$('#resizer').hide();
			$('#togglePdfA').text('Show PDF');

			this.layout();
		},

		togglePdf : function() {
			console.log('toggling PDF');
			if(this.pdfShown) {
				this.hidePdf();
			}
			else {
				this.showPdf();
			}
		},

		layout : function() {
			pdfWidth = $('#preprintPdf').width();
			if(this.pdfShown) {
				windowWidth = $(window).width();
				console.log('windowWidth: ' + windowWidth);
				resizerWidth = $('#resizer').width();
				console.log('resizerWidth: ' + resizerWidth);

				// Position resizer
				$('#resizer').css('left', '' + pdfWidth + 'px');

				// Position main content
				$('#outer').css('left', '' + (pdfWidth + resizerWidth) + 'px');
				$('#outer').css('width', '' + (windowWidth - pdfWidth - resizerWidth) + 'px');
			}
			else {
				$('#outer').css('left', '0');
				$('#outer').css('width', '100%');
			}
		}
	};
}

$(document).ready(function() {
	if(document.domain == 'peerj.com') {
		if(document.URL.charAt(document.URL.length - 1) != '/') {
			pieces = document.URL.split('/');
			if(pieces[pieces.length - 1].split('.').length > 1) {
				return;
			}
		}

		peerjSetup();
	}
	else if(document.domain == 'arxiv.org') {
		arxivSetup();
	}
	manager = window.preprintManager;

	$('#resizer').mousedown(function(event) {
		manager.widthStart = $('#preprintPdf').width();
		manager.mouseStart = event.pageX;
		manager.resizing = true;
		$('#preprintPdf').css('pointer-events', 'none');
		$('#outer').css('pointer-events', 'none');
	});

	$(window).mousemove(function(event) {
		if(manager.resizing) {
			delta = event.pageX - manager.mouseStart;
			pdfWidth = manager.widthStart + delta;
			if(pdfWidth < 0) {
				pdfWidth = 0;
			}

			maxWidth = $(window).width() - $('#resizer').width();
			if(pdfWidth > maxWidth) {
				pdfWidth = maxWidth;
			}

			$('#preprintPdf').width(pdfWidth);
			manager.layout();
		}
	});
	$(window).mouseup(function(event) {
		if(manager.resizing) {
			manager.resizing = false;
			$('#preprintPdf').css('pointer-events', '');
			$('#outer').css('pointer-events', '');
		}
	});

	$('#togglePdfA').click(function() { window.preprintManager.togglePdf(); });

	$(window).resize(function(){
	    window.preprintManager.layout();
	});

	$(window).scroll(function() {
		window.preprintManager.layout();
	});
});
