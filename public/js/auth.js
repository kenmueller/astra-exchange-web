document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const db = firebase.database()

	auth.onAuthStateChanged(user => {
		if (user) {
			db.ref(`users/${user.uid}/name`).on('value', snapshot => {
				if (snapshot.exists()) {
					document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = snapshot.val())
				} else {
					db.ref(`users/${user.uid}`).set({ name: document.getElementById('sign-up-name').value.trim(), email: document.getElementById('sign-up-email').value.trim(), balance: 0 })
					document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = document.getElementById('sign-up-name').value.trim())
				}
				document.querySelectorAll('.auth.sign-up').forEach(element => element.classList.add('is-hidden'))
				document.querySelectorAll('.auth.sign-in').forEach(element => element.classList.add('is-hidden'))
				document.querySelectorAll('.auth.user-dropdown').forEach(element => element.classList.remove('is-hidden'))
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
		auth.createUserWithEmailAndPassword(document.getElementById('sign-up-email').value, document.getElementById('sign-up-password').value).catch(error => {
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
		auth.signInWithEmailAndPassword(document.getElementById('sign-in-email').value, document.getElementById('sign-in-password').value).catch(error => {
			document.getElementById('complete-sign-in').classList.remove('is-loading')
			alert(error)
		})
	}

	function signOut() {
		auth.signOut().then(() => {
			document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
			window.location.href = '/'
		}, error => {
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
		document.querySelector('.navbar-burger.burger').classList.toggle('is-active')
		document.querySelector('.navbar-menu').classList.toggle('is-active')
	}

	function resetPassword() {
		const email = prompt('Enter your email')
		if (email) {
			auth.sendPasswordResetEmail(email)
			alert(`Password reset email sent to ${email}`)
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
	document.querySelectorAll('.auth.reset-password').forEach(element => element.addEventListener('click', resetPassword))
	document.getElementById('sign-up-name').addEventListener('input', signUpTextFieldChanged)
	document.getElementById('sign-up-email').addEventListener('input', signUpTextFieldChanged)
	document.getElementById('sign-up-password').addEventListener('input', signUpTextFieldChanged)
	document.getElementById('sign-in-email').addEventListener('input', signInTextFieldChanged)
	document.getElementById('sign-in-password').addEventListener('input', signInTextFieldChanged)
})