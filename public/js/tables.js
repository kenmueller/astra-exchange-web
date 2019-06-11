document.addEventListener('DOMContentLoaded', () => {
	const db = firebase.database()
	const auth = firebase.auth()
	const functions = firebase.functions()
	let user
	let tables = {}
	let currentTable

	const authCookie = document.cookie.match('(^|[^;]+)\\s*auth\\s*=\\s*([^;]+)')
    if (authCookie) {
        const name = authCookie.pop()
        document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = name)
        document.querySelectorAll('.auth.user-dropdown').forEach(element => element.classList.remove('is-hidden'))
        document.querySelectorAll('.navbar-item.companies').forEach(element => element.classList.remove('is-hidden'))
	}

	db.ref('tables').on('child_added', table => {
		const tableId = table.key
		const val = table.val()
		const tableObject = { id: tableId, name: val.name, price: val.price }
		tables[tableId] = tableObject
		db.ref(`tables/${tableId}/owner`).on('value', owner => {
			const ownerId = owner.val()
			db.ref(`users/${ownerId}/name`).on('value', ownerUser => {
				if (!owner.exists()) return
				tableObject.owner = { id: ownerId, name: ownerUser.val() }
			})
		})
	})
	
	auth.onAuthStateChanged(user_ => {
		if (user_) {
        	document.querySelectorAll('.navbar-item.companies').forEach(element => element.classList.remove('is-hidden'))
			const id = user_.uid
			db.ref(`users/${id}`).on('value', snapshot => {
				const val = snapshot.val()
                user = { id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, card: null }
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
		if (user.card) document.querySelectorAll('.settings.pin').forEach(element => element.innerHTML = user.card.pin)
	}

	function resetPassword() {
		auth.sendPasswordResetEmail(user.email)
		alert(`Password reset email sent to ${user.email}`)
	}

	function orderTable() {
		if (!currentTable) return
		setOrderTableElement('complete', element => element.classList.add('is-loading'))
		const stopLoading = () => setOrderTableElement('complete', element => element.classList.remove('is-loading'))
		functions.httpsCallable('orderTable')({ table: currentTable.id }).then(result => {
			stopLoading()
			result.data ? alert(result.data) : hideOrderTableModal()
		}).catch(stopLoading)
	}

	function setOrderTableElement(name, handler) {
		document.querySelectorAll(`.modal.order-table .order-table-${name}`).forEach(handler)
	}

	function showOrderTableModal(table) {
		currentTable = tables[table]
		if (!currentTable) return
		const hasOwner = currentTable.owner !== undefined
		setOrderTableElement('title', element => element.innerHTML = `Order Table ${currentTable.id}`)
		setOrderTableElement('name', element => element.innerHTML = currentTable.name)
		setOrderTableElement('price', element => element.innerHTML = `${currentTable.price} Astra${currentTable.price === 1 ? '' : 's'}`)
		setOrderTableElement('owner-field', element => element.style.display = hasOwner ? 'block' : 'none')
		setOrderTableElement('owner', element => element.innerHTML = hasOwner ? `${currentTable.owner.name}${currentTable.owner.id === user.id ? ' (you)' : ''}` : '')
		setOrderTableElement('complete', element => element.disabled = hasOwner)
		document.querySelectorAll('.modal.order-table').forEach(element => element.classList.add('is-active'))
	}

	function hideOrderTableModal() {
		document.querySelectorAll('.modal.order-table').forEach(element => element.classList.remove('is-active'))
	}
	
	setOrderTableElement('complete', element => element.addEventListener('click', orderTable))
	document.querySelectorAll('.button.password-reset').forEach(element => element.addEventListener('click', resetPassword))
	document.querySelectorAll('.table-element').forEach(element => element.addEventListener('click', () => showOrderTableModal(element.id)))
	document.querySelectorAll('.close-order-table').forEach(element => element.addEventListener('click', hideOrderTableModal))
})