document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const signOutButton = document.querySelector('.navbar-auth-button.sign-out')

	function signOut() {
		setLoading(signOutButton, true)
		auth.signOut().then(() => {
			setLoading(signOutButton, false)
			removeCookie('uid')
			removeCookie('name')
			document.querySelectorAll('.auth.sign-up').forEach(element => element.classList.remove('is-hidden'))
			document.querySelectorAll('.auth.sign-in').forEach(element => element.classList.remove('is-hidden'))
			document.querySelectorAll('.console-button').forEach(element => element.classList.add('is-hidden'))
			document.querySelectorAll('.auth.sign-out').forEach(element => element.classList.add('is-hidden'))
		}).catch(() => {
			setLoading(signOutButton, false)
			alert('An error occurred. Please try again')
		})
	}

	signOutButton.addEventListener('click', signOut)
})