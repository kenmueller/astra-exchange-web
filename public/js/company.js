function company(company) {
	document.addEventListener('DOMContentLoaded', () => {
		const auth = firebase.auth()
		const db = firebase.database()
		let user
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
					user = { id, name: val.name, email: val.email, balance: val.balance, reputation: val.reputation, card: null }
					document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = user.name)
					document.querySelectorAll('.user.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
					updateSettings()
					db.ref(`users/${id}/cards`).on('child_added', cardSnapshot => {
						const cardVal = cardSnapshot.val()
						user.card = { id: cardSnapshot.key, name: cardVal.name, pin: cardVal.pin }
						updateSettings()
					})
				})
				db.ref(`products/${company.id}`).on('child_added', snapshot => {
					const val = snapshot.val()
					company.products.push({ id: snapshot.key, image: val.image, name: val.name, price: val.price })
					updateProducts()
				})
				db.ref(`carts/${id}`).on('child_added', snapshot => {
					const val = snapshot.val()
					cart.push({ product: snapshot.key, company: val.company, quantity: val.quantity })
					updateCart()
				})
			} else {
				document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
				history.back()
			}
		})

		function updateSettings() {
			document.querySelectorAll('.settings.name').forEach(element => element.innerHTML = user.name)
			document.querySelectorAll('.settings.email').forEach(element => element.innerHTML = user.email)
			document.querySelectorAll('.settings.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
			document.querySelectorAll('.settings.reputation').forEach(element => element.innerHTML = user.reputation)
			if (user.card) document.querySelectorAll('.settings.pin').forEach(element => element.innerHTML = user.card.pin)
		}

		function updateProducts() {

		}

		function updateCart() {

		}
	})
}