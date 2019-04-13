document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()
	let user

	auth.onAuthStateChanged(function(newUser) {
		user = newUser
		if (user) {
			db.ref(`users/${user.uid}`).on('value', function(snapshot) {
				const val = snapshot.val()
				document.querySelectorAll('.user.name').forEach(element => element.innerHTML = `Hello, ${val.name}`)
			})
		}
	})

	function showSendModal() {
		document.querySelectorAll('.modal.send').forEach(element => element.classList.add('is-active'))
	}

	function hideSendModal() {
		document.querySelectorAll('.modal.send').forEach(element => element.classList.remove('is-active'))
	}

	function showCreateInvoiceModal() {
		document.querySelectorAll('.modal.create-invoice').forEach(element => element.classList.add('is-active'))
	}

	function hideCreateInvoiceModal() {
		document.querySelectorAll('.modal.create-invoice').forEach(element => element.classList.remove('is-active'))
	}

	function showTransactionsModal() {
		document.querySelectorAll('.modal.transactions').forEach(element => element.classList.add('is-active'))
	}

	function hideTransactionsModal() {
		document.querySelectorAll('.modal.transactions').forEach(element => element.classList.remove('is-active'))
	}

	function showInvoicesModal() {
		document.querySelectorAll('.modal.invoices').forEach(element => element.classList.add('is-active'))
	}

	function hideInvoicesModal() {
		document.querySelectorAll('.modal.invoices').forEach(element => element.classList.remove('is-active'))
	}

	function showYourIdModal() {
		document.querySelectorAll('.modal.your-id').forEach(element => element.classList.add('is-active'))
	}

	function hideYourIdModal() {
		document.querySelectorAll('.modal.your-id').forEach(element => element.classList.remove('is-active'))
	}

	document.querySelectorAll('.action.send').forEach(element => element.addEventListener('click', showSendModal))
	document.querySelectorAll('.action.create-invoice').forEach(element => element.addEventListener('click', showCreateInvoiceModal))
	document.querySelectorAll('.action.transactions').forEach(element => element.addEventListener('click', showTransactionsModal))
	document.querySelectorAll('.action.invoices').forEach(element => element.addEventListener('click', showInvoicesModal))
	document.querySelectorAll('.action.your-id').forEach(element => element.addEventListener('click', showYourIdModal))
})