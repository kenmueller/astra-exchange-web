document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()
	let user

	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		window.location.href = 'itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist'
	}
	loadDocs()

	auth.onAuthStateChanged(function(user_) {
		if (user_) {
			const id = user_.uid
			db.ref(`users/${id}`).on('value', function(snapshot) {
				const val = snapshot.val()
				user = { id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, card: null }
				updateSettings()
				db.ref(`users/${id}/cards`).on('child_added', function(cardSnapshot) {
					const cardVal = cardSnapshot.val()
					user.card = { id: cardSnapshot.key, name: cardVal.name, pin: cardVal.pin }
					updateSettings()
				})
			})
		}
	})

	function loadDocs() {
		document.querySelectorAll('.menu-list.docs').forEach(element => removeAllNodes(element))
		for (i in docs) {
			const i_ = parseInt(i)
			const doc = docs[i_]
			const a = document.createElement('a')
			a.className = 'doc'
			a.onclick = function() { selectDoc(i_) }
			a.innerHTML = doc.title
			const li = document.createElement('li')
			li.appendChild(a)
			document.querySelectorAll('.menu-list.docs').forEach(element => element.appendChild(li))
			if (i_ === 0) selectDoc(0)
		}
	}

	function removeAllNodes(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild)
		}
	}

	function updateSettings() {
		document.querySelectorAll('.settings.name').forEach(element => element.innerHTML = user.name)
		document.querySelectorAll('.settings.email').forEach(element => element.innerHTML = user.email)
		document.querySelectorAll('.settings.balance').forEach(element => element.innerHTML = user.balance)
		document.querySelectorAll('.settings.independence').forEach(element => element.innerHTML = user.independence === 0 ? 'Pending' : user.independence)
		if (user.card) {
			document.querySelectorAll('.settings.pin').forEach(element => element.innerHTML = user.card.pin)
		}
	}

	function dashboard() {
		if (user) {
			window.location.href = '/dashboard'
		} else {
			alert('You must be signed in to visit your dashboard')
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

	document.querySelectorAll('.go-to-dashboard').forEach(element => element.addEventListener('click', dashboard))
	document.querySelectorAll('.action.settings').forEach(element => element.addEventListener('click', showSettingsModal))
	document.querySelectorAll('.close-settings').forEach(element => element.addEventListener('click', hideSettingsModal))
	document.querySelectorAll('.button.password-reset').forEach(element => element.addEventListener('click', resetPassword))
})

function selectDoc(index) {
	document.querySelectorAll('a.doc.is-active').forEach(element => element.classList.remove('is-active'))
	document.querySelectorAll('.menu-list.docs').forEach(element => element.childNodes[index].childNodes[0].classList.add('is-active'))
	const doc = docs[index]
	document.querySelectorAll('.doc-title').forEach(element => element.innerHTML = doc.title)
	document.querySelectorAll('.doc-body').forEach(element => element.innerHTML = doc.body)
}

const docs = [
	{
		title: 'Getting Started',
		body: `
			<p><i>Tip:</i> <code>?</code> goes after the function name, and <code>&</code> goes in between every parameter.<p>
			<br>
			<h1 class="subtitle"><a onclick="selectDoc(1)">Making Transactions</a></h1>
			<p>Using the <code>transact</code> function <b>(the 4 digit pin is of the user that sends the transaction {FROM_ID})</b>:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=<b><i>{4_DIGIT_PIN}</i></b>&from=<b><i>{FROM_ID}</i></b>&to=<b><i>{TO_ID}</i></b>&amount=<b><i>{AMOUNT}</i></b>&message=<b><i>{MESSAGE}</i></b></code>
			<br><br>
			<p>The message field is optional:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=<b><i>{4_DIGIT_PIN}</i></b>&from=<b><i>{FROM_ID}</i></b>&to=<b><i>{TO_ID}</i></b>&amount=<b><i>{AMOUNT}</i></b></code>
			<br><br>
			<p>Example transaction:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=0000&from=e95Y6tKOvIS7CBlEdBn2UknzxMQ2&to=GwZX5OnFzGUl0UlXH97EGIeW70p1&amount=20&message=Take my money</code>
			<br><br>
			<p>(Not my real pin). That was an example transaction sent by me (Ken), received by Kai, and with an amount of 20 Astras and message "Take my money". Again, you can disregard the message field if needed.</p>
			<br>
			<a class="doc-link" onclick="selectDoc(1)">Read more</a>
		`
	},
	{
		title: 'Making Transactions',
		body: `

		`
	}
]