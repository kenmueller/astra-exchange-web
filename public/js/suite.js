document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const db = firebase.database()
	const storage = firebase.storage().ref()
	let user
	let rooms = []
	let yourRooms = []

	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		window.location.href = 'itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist'
	}

	auth.onAuthStateChanged(user_ => {
		if (user_) {
			const id = user_.uid
			db.ref(`users/${id}`).on('value', snapshot => {
				const val = snapshot.val()
				user = { id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, card: null }
				updateSettings()
				db.ref(`users/${id}/cards`).on('child_added', cardSnapshot => {
					const cardVal = cardSnapshot.val()
					user.card = { id: cardSnapshot.key, name: cardVal.name, pin: cardVal.pin }
					updateSettings()
				})
			})
			db.ref('rooms').on('child_added', snapshot => {
				const roomId = snapshot.key
				storage.child(`rooms/${roomId}`).getDownloadURL().then(url => {
					const val = snapshot.val()
					room = { id: roomId, image: url, name: val.name, url: val.url }
					rooms.push(room)
					updateRooms()
				})
			})
			db.ref(`users/${id}/rooms`).on('child_added', snapshot => {
				const roomId = snapshot.key
				const roomRef = rooms.find(room => room.id === roomId)
				if (roomRef) {
					yourRooms.push(Object.assign({}, roomRef))
					updateYourRooms()
				} else {
					db.ref(`rooms/${roomId}`).on('value', roomSnapshot => {
						storage.child(`rooms/${roomId}`).getDownloadURL().then(url => {
							const val = roomSnapshot.val()
							room = { id: roomId, image: url, name: val.name, url: val.url }
							yourRooms.push(room)
							updateYourRooms()
						})
					})
				}
			})
		} else {
			window.history.back()
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

	function showSettingsModal() {
		document.querySelectorAll('.modal.settings').forEach(element => element.classList.add('is-active'))
	}

	function hideSettingsModal() {
		document.querySelectorAll('.modal.settings').forEach(element => element.classList.remove('is-active'))
	}

	function resetPassword() {
		auth.sendPasswordResetEmail(user.email)
		alert(`Password reset email sent to ${user.email}`)
	}

	document.querySelectorAll('.action.settings').forEach(element => element.addEventListener('click', showSettingsModal))
	document.querySelectorAll('.close-settings').forEach(element => element.addEventListener('click', hideSettingsModal))
	document.querySelectorAll('.button.password-reset').forEach(element => element.addEventListener('click', resetPassword))
})