document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()

	if (/iPhone|iPad|iPod/i.test(navigator.userAgent))
		location.href = 'itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist'

	function signOut() {
		auth.signOut().then(() => {
			document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
			location.href = '/'
		}, error => {
			alert(error)
		})
	}

	function resetPassword() {
		const email = prompt('Enter your email')
		if (email) {
			auth.sendPasswordResetEmail(email)
			alert(`Password reset email sent to ${email}`)
		}
	}

	function toggleNavbarMenu() {
		document.querySelector('.navbar-burger.burger').classList.toggle('is-active')
		document.querySelector('.navbar-menu').classList.toggle('is-active')
	}

	document.querySelectorAll('.auth.sign-out').forEach(element => element.addEventListener('click', signOut))
	document.querySelectorAll('.navbar-burger.burger').forEach(element => element.addEventListener('click', toggleNavbarMenu))
	document.querySelectorAll('.auth.reset-password').forEach(element => element.addEventListener('click', resetPassword))
})