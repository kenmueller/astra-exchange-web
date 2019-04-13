document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()
	const actions = {
		'Send Money': showSendModal,
		'Create Invoice': showCreateInvoiceModal,
		'Transaction History': showTransactionsModal,
		'Invoices': showInvoicesModal,
		'Your ID': showYourIdModal
	}
	let user

	auth.onAuthStateChanged(function(newUser) {
		user = newUser
		if (user) {
			db.ref(`users/${user.uid}`).on('value').then(function(snapshot) {
				const val = snapshot.val()
				document.querySelectorAll('.user.name').forEach(element => element.innerHTML = `Hello, ${val.name}`)
			})
		} else {

		}
	})
})