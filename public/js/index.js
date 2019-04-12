document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()

	auth.onAuthStateChanged(function(user) {
		if (user) {
			document.querySelectorAll('.button.dashboard').forEach(element => element.classList.remove('is-hidden'))
		} else {
			document.querySelectorAll('.button.dashboard').forEach(element => element.classList.add('is-hidden'))
		}
	})
})