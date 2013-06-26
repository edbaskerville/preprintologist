/**
	Preprintologist

	Ed Baskerville
	The OpenPub Project

	Browser extension to show PDFs alongside PeerJ (and hopefully arXiv) metadata/discussion.
*/

function showPdf() {
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

	window.pdfShown = true;
	scalePdf();

	$('#togglePdfA').text('Hide PDF');
}

function hidePdf() {
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

	window.pdfShown = false;
	$('#togglePdfA').text('Show PDF');
}

function togglePdf() {
	if(window.pdfShown) {
		hidePdf();
	}
	else {
		showPdf();
	}
}

function scalePdf() {
	if(!window.pdfShown) {
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

$(document).ready(function() {
	// Insert Show/Hide Button
	dividers = $('li.divider-vertical');
	lastDivider = dividers.eq(dividers.length - 1);
	lastDivider.parent().append('<li id="togglePdfBtn"><a id="togglePdfA" href="#">Show PDF</a></li>');
	lastDivider.parent().append('<li class="divider-vertical"></li>');

	// Set initial shown state & assign show PDF handler
	window.pdfShown = false;
	$('#togglePdfBtn').click(togglePdf);
});

$(window).resize(function(){
    scalePdf();
});

$(window).scroll(function() {
	scalePdf();
});
