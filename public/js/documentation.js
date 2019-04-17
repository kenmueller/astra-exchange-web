document.addEventListener('DOMContentLoaded', function() {
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		window.location.href = 'itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist'
	}
})