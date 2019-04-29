document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const db = firebase.database()
	let user
	let companies = []
	let cart = []

	const authCookie = document.cookie.match('(^|[^;]+)\\s*auth\\s*=\\s*([^;]+)')
    if (authCookie) {
		const name = authCookie.pop()
		document.querySelectorAll('.user.name').forEach(element => element.innerHTML = name)
        document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = name)
        document.querySelectorAll('.auth.user-dropdown').forEach(element => element.classList.remove('is-hidden'))
    }

	auth.onAuthStateChanged(user_ => {
		if (user_) {
			const id = user_.uid
			db.ref(`users/${id}`).on('value', snapshot => {
				const val = snapshot.val()
				user = { id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, card: null }
				document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = user.name)
				document.querySelectorAll('.user.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
				updateSettings()
				db.ref(`users/${id}/cards`).on('child_added', cardSnapshot => {
					const cardVal = cardSnapshot.val()
					user.card = { id: cardSnapshot.key, name: cardVal.name, pin: cardVal.pin }
					updateSettings()
				})
			})
			db.ref('companies').on('child_added', snapshot => {
				const val = snapshot.val()
				companies.append({ id: snapshot.key, image: val.image, name: val.name, owner: val.owner, })
				updateCompanies()
			})
			db.ref(`carts/${id}`).on('child_added', snapshot => {
				const val = snapshot.val()
				cart.append({ product: snapshot.key, company: val.company, quantity: val.quantity })
				updateCart()
			})
		}
	})

	function updateSettings() {
		document.querySelectorAll('.settings.name').forEach(element => element.innerHTML = user.name)
		document.querySelectorAll('.settings.email').forEach(element => element.innerHTML = user.email)
		document.querySelectorAll('.settings.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
		document.querySelectorAll('.settings.independence').forEach(element => element.innerHTML = user.independence === 0 ? 'Pending' : user.independence)
		if (user.card) document.querySelectorAll('.settings.pin').forEach(element => element.innerHTML = user.card.pin)
	}

	function removeAllNodes(element) {
		while (element.firstChild)
			element.removeChild(element.firstChild)
	}

	function showModal(modal) {
		document.querySelectorAll(`.modal.${modal}`).forEach(element => element.classList.add('is-active'))
	}

	function hideModal(modal) {
		document.querySelectorAll(`.modal.${modal}`).forEach(element => element.classList.remove('is-active'))
	}

	function showSettingsModal() {
		showModal('settings')
	}

	function hideSettingsModal() {
		hideModal('settings')
	}

	function resetPassword() {
		auth.sendPasswordResetEmail(user.email)
		alert(`Password reset email sent to ${user.email}`)
	}

	document.querySelectorAll('.action.settings').forEach(element => element.addEventListener('click', showSettingsModal))
	document.querySelectorAll('.close-settings').forEach(element => element.addEventListener('click', hideSettingsModal))
	document.querySelectorAll('.button.password-reset').forEach(element => element.addEventListener('click', resetPassword))
})