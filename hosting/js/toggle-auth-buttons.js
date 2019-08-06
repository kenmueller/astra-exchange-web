(() => {
	const signUpButton = document.querySelector('.navbar-auth-button.sign-up')
	const signInButton = document.querySelector('.navbar-auth-button.sign-in')
	const signOutButton = document.querySelector('.navbar-auth-button.sign-out')
	const consoleButtons = document.querySelectorAll('.console-button')
	const largeAuthButtons = document.querySelectorAll('.large-auth-button')

	if (cookie('uid')) {
		signUpButton.classList.add('is-hidden')
		signInButton.classList.add('is-hidden')
		signOutButton.classList.remove('is-hidden')
		consoleButtons.forEach(element => element.classList.remove('is-hidden'))
		largeAuthButtons.forEach(element => element.classList.add('is-hidden'))
	} else {
		signUpButton.classList.remove('is-hidden')
		signInButton.classList.remove('is-hidden')
		signOutButton.classList.add('is-hidden')
		consoleButtons.forEach(element => element.classList.add('is-hidden'))
		largeAuthButtons.forEach(element => element.classList.remove('is-hidden'))
	}
})()