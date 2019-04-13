document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()
	let user
	let transactions = []
	let invoices = []

	auth.onAuthStateChanged(function(newUser) {
		user = newUser
		if (user) {
			db.ref(`users/${user.uid}`).on('value', function(snapshot) {
				const val = snapshot.val()
				document.querySelectorAll('.user.name').forEach(element => element.innerHTML = `Hello, ${val.name}`)
				document.querySelectorAll('.user.balance').forEach(element => element.innerHTML = val.balance)
				document.querySelectorAll('.user.independence').forEach(element => element.innerHTML = val.independence === 0 ? 'Pending' : val.independence)
				updateTransactionCount()
				updateOpenInvoiceCount()
			})
			db.ref(`transactions/${user.uid}`).on('child_added', function(snapshot) {
				const val = snapshot.val()
				const transaction = { id: snapshot.id, time: val.time, from: val.from, to: val.to, amount: val.amount, balance: val.balance, message: val.message }
				transactions.push(transaction)
				updateTransactionCount()
				updateTransactionsPreview(transaction)
			})
			db.ref(`invoices/${user.uid}`).on('child_added', function(snapshot) {
				const val = snapshot.val()
				const invoice = { id: snapshot.id, time: val.time, status: val.status, from: val.from, to: val.to, amount: val.amount, message: val.message }
				invoices.push(invoice)
				updateOpenInvoiceCount()
				updateInvoicesPreview(invoice)
			})
		}
	})

	function updateTransactionCount() {
		const transactionCount = transactions.length
		document.querySelectorAll('.user.transaction-count').forEach(element => element.innerHTML = transactionCount)
		document.querySelectorAll('.user.transaction-count-label').forEach(element => element.innerHTML = `Transaction${transactionCount === 1 ? '' : 's'}`)
	}

	function updateTransactionsPreview(transaction) {
		const outgoing = transaction.from === user.uid
		const tr = document.createElement('tr')
		tr.className = 'transaction'
		tr.innerHTML = `
			<td width="3%"><i class="fa fa-dollar-sign"></i></td>
			<td>${outgoing ? 'OUTGOING' : 'INCOMING'}</td>
			<td>${outgoing ? `TO ${transaction.to}` : `FROM ${transaction.from}`}</td>
			<td>${transaction.amount} Astras</td>
			<td><a class="button is-small is-primary view-transaction">view</a></td>
		`
		if (document.getElementById('transactions-preview').childNodes.length === 10) {
			document.getElementById('transactions-preview').removeChild(document.getElementById('transactions-preview').childNodes[9])
		}
		document.getElementById('transactions-preview').insertBefore(tr, document.getElementById('transactions-preview').childNodes[0])
	}

	function updateOpenInvoiceCount() {
		const openInvoiceCount = invoices.filter(invoice => invoice.status === 'pending').length
		document.querySelectorAll('.user.open-invoice-count').forEach(element => element.innerHTML = openInvoiceCount)
		document.querySelectorAll('.user.open-invoice-count-label').forEach(element => element.innerHTML = `Open Invoice${openInvoiceCount === 1 ? '' : 's'}`)
	}

	function updateInvoicesPreview(invoice) {

	}

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
	document.querySelectorAll('.close-send').forEach(element => element.addEventListener('click', hideSendModal))
	document.querySelectorAll('.action.create-invoice').forEach(element => element.addEventListener('click', showCreateInvoiceModal))
	document.querySelectorAll('.close-create-invoice').forEach(element => element.addEventListener('click', hideCreateInvoiceModal))
	document.querySelectorAll('.action.transactions').forEach(element => element.addEventListener('click', showTransactionsModal))
	document.querySelectorAll('.close-transactions').forEach(element => element.addEventListener('click', hideTransactionsModal))
	document.querySelectorAll('.action.invoices').forEach(element => element.addEventListener('click', showInvoicesModal))
	document.querySelectorAll('.close-invoices').forEach(element => element.addEventListener('click', hideInvoicesModal))
	document.querySelectorAll('.action.your-id').forEach(element => element.addEventListener('click', showYourIdModal))
	document.querySelectorAll('.close-your-id').forEach(element => element.addEventListener('click', hideYourIdModal))
})