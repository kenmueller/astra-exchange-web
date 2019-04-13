document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()

	auth.onAuthStateChanged(function(user) {
		if (user) {
			window.location.href = '/dashboard'
		}
	})
})