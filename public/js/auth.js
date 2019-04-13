document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()

	auth.onAuthStateChanged(function(user) {
		if (user) {
			db.ref(`users/${user.uid}/name`).on('value', function(snapshot) {
				document.querySelectorAll('.auth.sign-up').forEach(element => element.classList.add('is-hidden'))
				document.querySelectorAll('.auth.sign-in').forEach(element => element.classList.add('is-hidden'))
				document.querySelectorAll('.auth.user-dropdown').forEach(element => element.classList.remove('is-hidden'))
				document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = snapshot.val())
				hideSignUpModal()
				hideSignInModal()
			})
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
		document.getElementById('complete-sign-up').classList.add('is-loading')
		auth.createUserWithEmailAndPassword(document.getElementById('sign-up-email').value, document.getElementById('sign-up-password').value).catch(function(error) {
			document.getElementById('complete-sign-up').classList.remove('is-loading')
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
		document.getElementById('complete-sign-in').classList.add('is-loading')
		auth.signInWithEmailAndPassword(document.getElementById('sign-in-email').value, document.getElementById('sign-in-password').value).catch(function(error) {
			document.getElementById('complete-sign-in').classList.remove('is-loading')
			alert(error)
		})
	}

	function signOut() {
		auth.signOut().then(function() {
			window.location.href = '/'
		}, function(error) {
			alert(error)
		})
	}

	function signUpTextFieldChanged() {
		document.getElementById('complete-sign-up').disabled = !(document.getElementById('sign-up-name').value.trim().length && document.getElementById('sign-up-email').value.trim().length && document.getElementById('sign-up-password').value.trim().length)
	}

	function signInTextFieldChanged() {
		document.getElementById('complete-sign-in').disabled = !(document.getElementById('sign-in-email').value.trim().length && document.getElementById('sign-in-password').value.trim().length)
	}

	function toggleNavbarMenu() {
		if (document.querySelector('.navbar-burger.burger').classList.contains('is-active')) {
			document.querySelector('.navbar-burger.burger').classList.remove('is-active')
		} else {
			document.querySelector('.navbar-burger.burger').classList.add('is-active')
		}
	}

	document.querySelectorAll('.auth.sign-up').forEach(element => element.addEventListener('click', showSignUpModal))
	document.querySelectorAll('.close-sign-up').forEach(element => element.addEventListener('click', hideSignUpModal))
	document.querySelectorAll('.auth.complete-sign-up').forEach(element => element.addEventListener('click', signUp))
	document.querySelectorAll('.auth.sign-in').forEach(element => element.addEventListener('click', showSignInModal))
	document.querySelectorAll('.close-sign-in').forEach(element => element.addEventListener('click', hideSignInModal))
	document.querySelectorAll('.auth.complete-sign-in').forEach(element => element.addEventListener('click', signIn))
	document.querySelectorAll('.auth.sign-out').forEach(element => element.addEventListener('click', signOut))
	document.querySelectorAll('.navbar-burger.burger').forEach(element => element.addEventListener('click', toggleNavbarMenu))
	document.getElementById('sign-up-name').addEventListener('input', signUpTextFieldChanged)
	document.getElementById('sign-up-email').addEventListener('input', signUpTextFieldChanged)
	document.getElementById('sign-up-password').addEventListener('input', signUpTextFieldChanged)
	document.getElementById('sign-in-email').addEventListener('input', signInTextFieldChanged)
	document.getElementById('sign-in-password').addEventListener('input', signInTextFieldChanged)
})