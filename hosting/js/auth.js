document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const db = firebase.database()
	const firestore = firebase.firestore()

	auth.onAuthStateChanged(user => {
		if (user)
			db.ref(`users/${user.uid}/name`).once('value').then(snapshot => {
				setCookie('uid', user.uid)
				if (snapshot.exists()) {
					setCookie('name', snapshot.val())
					handleSignIn()
				} else {
					const name = document.querySelector('#sign-up-name').value.trim()
					const setObject = {
						name,
						email: document.querySelector('#sign-up-email').value.trim(),
						balance: 0,
						reputation: 0
					}
					firestore.doc(`users/${user.uid}`).set(setObject).then(() =>
						db.ref(`users/${user.uid}`).set(setObject)
					).then(() => handleSignIn())
					setCookie('name', name)
				}
			})
		else {
			document.querySelectorAll('.auth.sign-up').forEach(element => element.classList.remove('is-hidden'))
			document.querySelectorAll('.auth.sign-in').forEach(element => element.classList.remove('is-hidden'))
			document.querySelectorAll('.console-button').forEach(element => element.classList.add('is-hidden'))
			document.querySelectorAll('.auth.sign-out').forEach(element => element.classList.add('is-hidden'))
		}
	})

	function handleSignIn() {
		document.querySelectorAll('.auth.sign-up').forEach(element => element.classList.add('is-hidden'))
		document.querySelectorAll('.auth.sign-in').forEach(element => element.classList.add('is-hidden'))
		document.querySelectorAll('.console-button').forEach(element => element.classList.remove('is-hidden'))
		document.querySelectorAll('.auth.sign-out').forEach(element => element.classList.remove('is-hidden'))
		hideSignUpModal()
		hideSignInModal()
	}

	function showSignUpModal() {
		document.querySelectorAll('.modal.sign-up').forEach(element => element.classList.add('is-active'))
	}

	function hideSignUpModal() {
		document.querySelectorAll('.modal.sign-up').forEach(element => element.classList.remove('is-active'))
	}

	function signUp() {
		setLoading(document.querySelector('#complete-sign-up'), true)
		auth.createUserWithEmailAndPassword(document.querySelector('#sign-up-email').value, document.querySelector('#sign-up-password').value).catch(error => {
			setLoading(document.querySelector('#complete-sign-up'), false)
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
		setLoading(document.querySelector('#complete-sign-in'), true)
		auth.signInWithEmailAndPassword(document.querySelector('#sign-in-email').value, document.querySelector('#sign-in-password').value).catch(error => {
			setLoading(document.querySelector('#complete-sign-in'), false)
			alert(error)
		})
	}

	function signUpTextFieldChanged() {
		document.querySelector('#complete-sign-up').disabled = !(
			document.querySelector('#sign-up-name').value.trim().length &&
			document.querySelector('#sign-up-email').value.trim().length &&
			document.querySelector('#sign-up-password').value.trim().length > 5
		)
	}

	function signInTextFieldChanged() {
		document.querySelector('#complete-sign-in').disabled = !(
			document.querySelector('#sign-in-email').value.trim().length &&
			document.querySelector('#sign-in-password').value.trim().length
		)
	}

	document.querySelectorAll('.auth.sign-up').forEach(element => element.addEventListener('click', showSignUpModal))
	document.querySelectorAll('.close-sign-up').forEach(element => element.addEventListener('click', hideSignUpModal))
	document.querySelectorAll('.auth.complete-sign-up').forEach(element => element.addEventListener('click', signUp))
	document.querySelectorAll('.auth.sign-in').forEach(element => element.addEventListener('click', showSignInModal))
	document.querySelectorAll('.close-sign-in').forEach(element => element.addEventListener('click', hideSignInModal))
	document.querySelectorAll('.auth.complete-sign-in').forEach(element => element.addEventListener('click', signIn))
	document.querySelector('#sign-up-name').addEventListener('input', signUpTextFieldChanged)
	document.querySelector('#sign-up-email').addEventListener('input', signUpTextFieldChanged)
	document.querySelector('#sign-up-password').addEventListener('input', signUpTextFieldChanged)
	document.querySelector('#sign-in-email').addEventListener('input', signInTextFieldChanged)
	document.querySelector('#sign-in-password').addEventListener('input', signInTextFieldChanged)
})