/**
	Preprintologist

	Ed Baskerville
	The OpenPub Project

	Browser extension to show PDFs alongside PeerJ (and hopefully arXiv) metadata/discussion.
*/

function makePeerJManager() {
	// Insert Show/Hide Button
	dividers = $('li.divider-vertical');
	lastDivider = dividers.eq(dividers.length - 1);
	lastDivider.parent().append('<li id="togglePdfBtn"><a id="togglePdfA" href="#">Show PDF</a></li>');
	lastDivider.parent().append('<li class="divider-vertical"></li>');

	// Construct manager
	manager = {
		pdfShown: false,

		showPdf : function() {
			// Remove sidebars
			$('.article-item-leftbar-wrap').hide();
			$('.article-item-rightbar-wrap').hide();

			if($('#placeholder').length) {
				$('#placeholder').show();
			}
			else {
				$('#item-content').prepend('<div id="placeholder" class="span6"></div>');
			}

			// Make main content smaller
			$('#article-item-middle').removeClass('span7');
			$('#article-item-middle').addClass('span6');
			$('#article-item-middle').addClass('offset6');

			// Make feedback form smaller
			feedbackForm = $('#item-feedback-form').parent();
			feedbackForm.removeClass('span7');
			feedbackForm.addClass('span6');
			$('#peerj_feedbackbundle_feedbacktype_feedback').width(550);

			if($('#preprintPdf').length) {
				$('#preprintPdf').show();
			}
			else {
				docUrl = document.URL;
				pdfUrl = docUrl.substring(0, docUrl.lastIndexOf("/")) + '.pdf';

				$('body').append('<iframe frameborder="0" id="preprintPdf" class="span7" src="' + pdfUrl + '"></iframe>');
			}

			this.pdfShown = true;
			$('#togglePdfA').text('Hide PDF');

			this.scalePdf();
		},

		hidePdf : function() {
			// Restore sidebars
			$('.article-item-leftbar-wrap').show();
			$('.article-item-rightbar-wrap').show();

			// Hide placeholder
			$('#placeholder').hide();

			// Restore main content size
			$('#article-item-middle').removeClass('span6');
			$('#article-item-middle').removeClass('offset6');
			$('#article-item-middle').addClass('span7');

			// Restore feedback form size
			feedbackForm = $('#item-feedback-form').parent();
			feedbackForm.removeClass('span6');
			feedbackForm.addClass('span7');
			$('#peerj_feedbackbundle_feedbacktype_feedback').width(635);

			$('#preprintPdf').hide();

			this.pdfShown = false;
			$('#togglePdfA').text('Show PDF');
		},

		togglePdf : function() {
			if(this.pdfShown) {
				this.hidePdf();
			}
			else {
				this.showPdf();
			}
		},

		scalePdf : function() {
			if(!this.pdfShown) {
				return;
			}

			offset = $('#placeholder').offset();
			width = offset.left + $('#placeholder').width();

			// Adjust height based on navbar
			navHeight = $('.navbar').height();
			$('#preprintPdf').css('top', '' + navHeight + 'px');
			$('#preprintPdf').width(width);

			// Adjust bottom based on footer
			scrollTop = $(document).scrollTop();
			windowHeight = $(window).height();
			footerTop = $('#footer').offset().top;
			footerVisible = scrollTop + windowHeight - footerTop;

			$('#preprintPdf').height($(window).height() - navHeight - (footerVisible > 0 ? footerVisible : 0));

			//$('#preprintPdf').height($(window).height() - offset.top - 10);
		}
	}; // end of PeerJ manager object definition
	return manager;
}

function makeArxivManager() {
	var pdfUrl = null;
	$('#abs > .extra-services > .full-text > ul > li > a').each(function(index) {
		if($(this).text() == 'PDF') {
			pdfUrl = $(this).attr('href');
		}
	});

	if(pdfUrl == null) {
		return null;
	}

	manager = {
		pdfShown : false,
		resizing: false,

		showPdf : function() {
			this.pdfShown = true;
			$('#preprintPdf').show();
			$('#resizer').show();
			$('#togglePdfA').text('Hide PDF');

			this.scalePdf();
		},

		hidePdf : function() {
			this.pdfShown = false;
			$('#preprintPdf').hide();
			$('#resizer').hide();
			$('#togglePdfA').text('Show PDF');

			this.scalePdf();
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

		scalePdf : function() {
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

	$('.extra-services').prepend('<div class="full-text"><h2><a href="#" id="togglePdfA">Show PDF</a></h2></div>');

	// Put everything in body into an inner div
	$('body').prepend('<div id="outer"></div>');
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
			manager.scalePdf();
		}
	});
	$(window).mouseup(function(event) {
		if(manager.resizing) {
			manager.resizing = false;
			$('#preprintPdf').css('pointer-events', 'auto');
			$('#outer').css('pointer-events', 'auto');
		}
	});

	return manager;
}

$(document).ready(function() {
	if(document.domain == 'peerj.com') {
		window.preprintManager = makePeerJManager();
	}
	else if(document.domain == 'arxiv.org') {
		window.preprintManager = makeArxivManager();
	}

	$('#togglePdfA').click(function() { window.preprintManager.togglePdf(); });
});

$(window).resize(function(){
    window.preprintManager.scalePdf();
});

$(window).scroll(function() {
	window.preprintManager.scalePdf();
});
