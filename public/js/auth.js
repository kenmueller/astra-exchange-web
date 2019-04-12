document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()

	auth.onAuthStateChanged(function(user) {
		if (user) {
			document.querySelectorAll('.auth.sign-up').forEach(element => element.classList.add('is-hidden'))
			document.querySelectorAll('.auth.sign-in').forEach(element => element.classList.add('is-hidden'))
			document.querySelectorAll('.auth.dropdown').forEach(element => element.classList.remove('is-hidden'))
			document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = user.displayName)
		} else {
			document.querySelectorAll('.auth.sign-up').forEach(element => element.classList.remove('is-hidden'))
			document.querySelectorAll('.auth.sign-in').forEach(element => element.classList.remove('is-hidden'))
			document.querySelectorAll('.auth.dropdown').forEach(element => element.classList.add('is-hidden'))
		}
	})

	function showSignUpModal() {
		document.querySelectorAll('.modal.sign-up').forEach(element => element.classList.add('is-active'))
	}

	function hideSignUpModal() {
		document.querySelectorAll('.modal.sign-up').forEach(element => element.classList.remove('is-active'))
	}

	function signUp() {
		auth.createUserWithEmailAndPassword(document.getElementById('sign-up-email').value, document.getElementById('sign-up-password').value).catch(function(error) {
			alert(error)
		})
	}

	function showSignInModal() {
		document.querySelectorAll('.modal.sign-in').forEach(element => element.classList.add('is-active'))
	}

	function hideSignInModal() {
		document.querySelectorAll('.modal.sign-in').forEach(element => element.classList.remove('is-active'))
	}

	function signIn() {
		auth.signInWithEmailAndPassword(document.getElementById('sign-in-email').value, document.getElementById('sign-in-password').value).catch(function(error) {
			alert(error)
		})
	}

	document.querySelectorAll('.auth.sign-up').forEach(element => element.addEventListener('click', showSignUpModal))
	document.querySelectorAll('.close-sign-up').forEach(element => element.addEventListener('click', hideSignUpModal))
	document.querySelectorAll('.auth.complete-sign-up').forEach(element => element.addEventListener('click', signUp))
	document.querySelectorAll('.auth.sign-in').forEach(element => element.addEventListener('click', showSignInModal))
	document.querySelectorAll('.close-sign-in').forEach(element => element.addEventListener('click', hideSignInModal))
	document.querySelectorAll('.auth.complete-sign-in').forEach(element => element.addEventListener('click', signIn))
})