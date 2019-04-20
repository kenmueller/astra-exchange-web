document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const db = firebase.database()
	let user

	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		window.location.href = 'itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist'
	}
	loadDocs()

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
		}
	})

	function loadDocs() {
		document.querySelectorAll('.menu-list.docs').forEach(element => removeAllNodes(element))
		for (i in docs) {
			const i_ = parseInt(i)
			const doc = docs[i_]
			const a = document.createElement('a')
			a.className = 'doc'
			a.onclick = () => selectDoc(i_)
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
            <h1 class="subtitle">Use the Astra Exchange <code>&lt;script&gt;</code> tag</h1>
            <p><b>Copy and paste into the <code>head</code> of your HTML file:</b></p>
            <br>
            <code>&lt;script src="https://astra.exchange/api"&gt;&lt;/script&gt;</code>
            <br>
            <hr>
            <h1 class="subtitle">Making Transactions</h1>
			<p>Using the <code>transact</code> function:</p>
            <br>
<pre>
exchange().transact('1234', 'e95Y6tKOvIS7CBlEdBn2UknzxMQ2', 'GwZX5OnFzGUl0UlXH97EGIeW70p1', 20, 'Take my money', () => {
    alert('Successful transaction')
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature (remember to put <code>exchange()</code> in front):</b></p>
            <br>
<pre>
transact(pin: string,
         from: string,
         to: string,
         amount: double,
         message: string|null,
         success: () => void,
         failure: (status: int, response: string) => void)
</pre>
			<br>
			<a class="doc-link" onclick="selectDoc(1)">Read more</a>
			<br><br><br>
			<h1 class="subtitle">Accessing User Data</h1>
			<p>Using the <code>userWithId</code> function (<b>IMPORTANT - </b>Set the pin as <code>null</code> to only get public user data):</p>
            <br>
<pre>
exchange().userWithId('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234', user => {
    console.log(user)
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a>):</b></p>
            <br>
<pre>
userWithId(id: string,
           pin: string,
           success: (user: any[]) => void,
           failure: (status: int, response: string) => void)
</pre>
            <br>
            <p>Using the <code>userWithEmail</code> function (<b>IMPORTANT - </b>Set the pin as <code>null</code> to only get public user data):</p>
            <br>
<pre>
exchange().userWithEmail('ken@adastraschool.org', '1234', user => {
    console.log(user)
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a>):</b></p>
            <br>
<pre>
userWithEmail(id: string,
              pin: string,
              success: (user: any[]) => void,
              failure: (status: int, response: string) => void)
</pre>
            <br>
            <p>Using the <code>transactions</code> function to access all of a user's transactions:</p>
            <br>
<pre>
exchange().transactions('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234', transactions => {
    console.log(transactions)
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature (transactions is a list of <a onclick="selectDoc(2)">transaction objects</a>):</b></p>
            <br>
<pre>
transactions(id: string,
             pin: string,
             success: (transactionList: any[]) => void,
             failure: (status: int, response: string) => void)
</pre>
            <br>
            <a class="doc-link" onclick="selectDoc(2)">Read more</a>
            <br><br><br>
            <h1 class="subtitle">Retrieving all Users</h1>
			<p>Using the <code>users</code> function (<b>NOTE - </b>Returns only public user data):</p>
            <br>
<pre>
exchange().users(users => {
    console.log(users)
})
</pre>
            <br>
            <p><b>Type signature (users is a list of <a onclick="selectDoc(3)">user objects</a>):</b></p>
            <br>
<pre>
users(completion: (userList: any[]) => void)
</pre>
            <br>
            <a class="doc-link" onclick="selectDoc(3)">Read more</a>
		`
	},
	{
		title: 'Making Transactions',
		body: `
			<h1 class="subtitle">Using the <code>exchange().transact</code> function</h1>
<pre>
exchange().transact('1234', 'e95Y6tKOvIS7CBlEdBn2UknzxMQ2', 'GwZX5OnFzGUl0UlXH97EGIeW70p1', 20, 'Take my money', () => {
    alert('Successful transaction')
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature:</b></p>
            <br>
<pre>
transact(pin: string,
         from: string,
         to: string,
         amount: double,
         message: string|null,
         success: () => void,
         failure: (status: int, response: string) => void)
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
            <p>Seventh (last parameter): The error function. This function is called if there was an error when the transaction was created. It takes in 2 inputs, the first one being the error code (status), and the second being the error message (SEE BELOW).</p>
            <br>
            <h1 class="subtitle">Possible errors</h1>
            <p><b>400:</b> Invalid parameters</p>
            <p><b>404:</b> Invalid user ID</p>
            <p><b>403:</b> Insufficient balance</p>
            <p><b>401:</b> Invalid pin</p>
            <p><b>500:</b> Unknown error. Please try again</p>
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