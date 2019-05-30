document.addEventListener('DOMContentLoaded', () => {
	const db = firebase.database()
	const auth = firebase.auth()
	const functions = firebase.functions()
	let user
	let currentTable

	const authCookie = document.cookie.match('(^|[^;]+)\\s*auth\\s*=\\s*([^;]+)')
    if (authCookie) {
        const name = authCookie.pop()
        document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = name)
        document.querySelectorAll('.auth.user-dropdown').forEach(element => element.classList.remove('is-hidden'))
        document.querySelectorAll('.navbar-item.companies').forEach(element => element.classList.remove('is-hidden'))
	}
	
	auth.onAuthStateChanged(user_ => {
		if (user_) {
            document.querySelectorAll('.navbar-item.companies').forEach(element => element.classList.remove('is-hidden'))
			const id = user_.uid
			db.ref(`users/${id}`).on('value', snapshot => {
				const val = snapshot.val()
                user = { id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, card: null }
                document.cookie = `auth=${user.name}; expires=Thu, 01 Jan 3000 00:00:00 GMT`
				updateSettings()
				db.ref(`users/${id}/cards`).on('child_added', cardSnapshot => {
					const cardVal = cardSnapshot.val()
					user.card = { id: cardSnapshot.key, name: cardVal.name, pin: cardVal.pin }
					updateSettings()
				})
			})
		}
	})
		
	function updateSettings() {
		document.querySelectorAll('.settings.name').forEach(element => element.innerHTML = user.name)
		document.querySelectorAll('.settings.email').forEach(element => element.innerHTML = user.email)
		document.querySelectorAll('.settings.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
		document.querySelectorAll('.settings.independence').forEach(element => element.innerHTML = user.independence === 0 ? 'Pending' : user.independence)
		if (user.card) {
			document.querySelectorAll('.settings.pin').forEach(element => element.innerHTML = user.card.pin)
		}
	}

	function resetPassword() {
		auth.sendPasswordResetEmail(user.email)
		alert(`Password reset email sent to ${user.email}`)
	}

	function orderTable(table) {
		return functions.httpsCallable('orderTable')({ table })
	}

	function showOrderTableModal(table) {
		currentTable = table
		
		document.querySelectorAll('.modal.order-table').forEach(element => element.classList.add('is-active'))
	}

	function hideOrderTableModal() {
		document.querySelectorAll('.modal.order-table').forEach(element => element.classList.remove('is-active'))
	}
	
	document.querySelectorAll('.table-element').forEach(element => element.addEventListener('click', () => showOrderTableModal(element.id)))
})