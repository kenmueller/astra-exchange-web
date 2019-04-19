document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	let user

	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		window.location.href = 'itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist'
	}

	auth.onAuthStateChanged(user_ => {
		user = user_
		if (user) {
			window.location.href = '/dashboard'
		}
	})

	function dashboard() {
		if (user) {
			window.location.href = '/dashboard'
		} else {
			alert('You must be signed in to visit your dashboard')
		}
	}

	document.querySelectorAll('.go-to-dashboard').forEach(element => element.addEventListener('click', dashboard))
})