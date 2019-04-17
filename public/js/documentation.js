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
			<h1 class="subtitle">Making Transactions</h1>
			<p>Using the <code>transact</code> function:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=<b><i>{4_DIGIT_PIN}</i></b>&from=<b><i>{FROM_ID}</i></b>&to=<b><i>{TO_ID}</i></b>&amount=<b><i>{AMOUNT}</i></b>&message=<b><i>{MESSAGE}</i></b></code>
			<br><br>
			<p>The message field is optional:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=<b><i>{4_DIGIT_PIN}</i></b>&from=<b><i>{FROM_ID}</i></b>&to=<b><i>{TO_ID}</i></b>&amount=<b><i>{AMOUNT}</i></b></code>
			<br><br>
			<a class="doc-link" onclick="selectDoc(1)">Read more</a>
			<br><br>
			<h1 class="subtitle">Getting your User ID</h1>
			<p>To access your public info:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/user?email=<b><i>{YOUR_EMAIL}</i></b></code>
			<br><br>
			<p>To access your private info, you also need to specify your pin. <code>email</code> can be swapped with <code>id</code> if you already know your ID:<p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/user?pin=<b><i>{4_DIGIT_PIN}</i></b>&email=<b><i>{YOUR_EMAIL}</i></b></code>
			<br><br>
			<a class="doc-link" onclick="selectDoc(2)">Read more</a>
		`
	},
	{
		title: 'Making Transactions',
		body: `
			<h1 class="subtitle">Using the <code>transact</code> function</h1>
            <p><b>Copy and paste into .js file</b>:</p>
            <br>
<pre>
const transact = (pin, from, to, amount, message, success, failure) => {
    fetch(\`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=\${pin}&from=\${from}&to=\${to}&amount=\${amount}\${message ? \`&message=\${message}\` : ''}\`).then(response => {
        if (response.readyState === 4) {
            switch (response.status) {
                case 200:
                    success()
                    break
                case 400:
                    failure(400, 'Bad request')
                    break
                case 404:
                    failure(404, 'Invalid user ID')
                    break
                case 403:
                    failure(403, 'Insufficient balance')
                    break
                case 401:
                    failure(401, 'Invalid pin')
                    break
                default:
                    failure(500, 'Unknown error. Please try again')
            }
        }
    })
}
</pre>
			<br>
			<p>Here's how you would call the function:</p>
			<br>
<pre>
transact('1234', 'e95Y6tKOvIS7CBlEdBn2UknzxMQ2', 'GwZX5OnFzGUl0UlXH97EGIeW70p1', 20, 'Take my money', () => {
    alert('Successful transaction')
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p>First parameter: the user's pin (must be a string).</p>
            <br>
            <p>Second: the user's ID. Third: the recipient's ID.</p>
            <br>
            <p>Fourth: the amount (must be an number).</p>
            <br>
            <p>Fifth: the message (can be left blank, or pass in null if you want).</p>
            <br>
            <p>Sixth (the first function): The success function. This function is called if the transaction was created successfully.</p>
            <br>
            <p>Seventh (last parameter): The error function. This function is called if there was an error when the transaction was created. It takes in 2 inputs, the first one being the error code (status), and the second being the error message created above. You can look at the function declaration to see what those error codes mean.</p>
            <br>
            <h1 class="subtitle">Test in your browser</h1>
			<p><b>The 4 digit pin is of the user that sends the transaction (the {FROM_ID})</b>:</p>
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
			<p>First, get your user ID:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/user?email=<b><i>{YOUR_EMAIL}</i></b></code>
			<br><br>
			<p>If you haven't read <a class="doc-link" onclick="selectDoc(2)">Authentication & User Data</a> yet, now is a good time to read it. You will need to be able to get multiple User IDs.</p>
			<br>
			<p>Try using your pin and ID, along with someone else's ID, and send 1 Astra to them. Type the url you create into a new tab. You should get a screen like this:</p>
			<img src="/images/documentation/success-transaction.png">
			<p>Or, if you entered your pin incorrectly:</p>
			<img src="/images/documentation/invalid-pin.png">
		`
	},
	{
		title: 'Authentication & User Data',
		body: `
			<h1 class="subtitle">Getting your User ID</h1>
			<p>To access your public info (ID, name, email, balance):</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/user?email=<b><i>{YOUR_EMAIL}</i></b></code>
			<br><br>
			<p>To access your private info (independence, pin, cards), you also need to specify your pin. <code>email</code> can be swapped with <code>id</code> if you already know your ID:<p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/user?pin=<b><i>{4_DIGIT_PIN}</i></b>&email=<b><i>{YOUR_EMAIL}</i></b></code>
			<br><br>
			<p>Or, if you know your ID:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/user?pin=<b><i>{4_DIGIT_PIN}</i></b>&id=<b><i>{YOUR_ID}</i></b></code>
			<br><br>
			<h1 class="subtitle">Authentication</h1>
			<p>People logging in to your website using their Astra Exchange account should be asked to give their email & pin. But how do you know if they entered their pin correctly? Call the <code>user</code> function with their pin and email:</p>
			<br>
			<code>https://us-central1-astra-exchange.cloudfunctions.net/user?pin=<b><i>{4_DIGIT_PIN}</i></b>&email=<b><i>{EMAIL}</i></b></code>
			<br><br>
			<p>If you get back a response with status 401 along the lines of "Invalid pin for user <b><i>{USER_ID}</i></b>", alert the user that their pin was incorrect.</p>
			<br>
			<p>If instead you get a 404 along the lines of "No user with email <b><i>{EMAIL}</i></b>", alert the user that their email was incorrect.</p>
		`
	},
	{
		title: 'Retrieve all Users',
		body: `

		`
	}
]