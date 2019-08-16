document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const db = firebase.database()
	let user

    const authCookie = document.cookie.match('(^|[^;]+)\\s*auth\\s*=\\s*([^;]+)')
    if (authCookie) {
        const name = authCookie.pop()
        document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = name)
        document.querySelectorAll('.auth.user-dropdown').forEach(element => element.classList.remove('is-hidden'))
        document.querySelectorAll('.navbar-item.companies').forEach(element => element.classList.remove('is-hidden'))
    }
	loadDocs()

	auth.onAuthStateChanged(user_ => {
		if (user_) {
            document.querySelectorAll('.navbar-item.companies').forEach(element => element.classList.remove('is-hidden'))
			const id = user_.uid
			db.ref(`users/${id}`).on('value', snapshot => {
				const val = snapshot.val()
                user = { id, name: val.name, email: val.email, balance: val.balance, reputation: val.reputation, card: null }
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
        }
        const selectedDocIndex = new URLSearchParams(location.search).get('i') || 0
        selectDoc(selectedDocIndex < docs.length ? selectedDocIndex : 0)
	}

	function removeAllNodes(element) {
		while (element.firstChild)
			element.removeChild(element.firstChild)
	}

	function updateSettings() {
		document.querySelectorAll('.settings.name').forEach(element => element.innerHTML = user.name)
		document.querySelectorAll('.settings.email').forEach(element => element.innerHTML = user.email)
		document.querySelectorAll('.settings.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
		document.querySelectorAll('.settings.reputation').forEach(element => element.innerHTML = user.reputation)
		if (user.card) {
			document.querySelectorAll('.settings.pin').forEach(element => element.innerHTML = user.card.pin)
		}
	}

	function resetPassword() {
		auth.sendPasswordResetEmail(user.email)
		alert(`Password reset email sent to ${user.email}`)
	}

	document.querySelectorAll('.button.password-reset').forEach(element => element.addEventListener('click', resetPassword))
})

function selectDoc(index) {
	document.querySelectorAll('a.doc.is-active').forEach(element => element.classList.remove('is-active'))
	document.querySelectorAll('.menu-list.docs').forEach(element => element.childNodes[index].childNodes[0].classList.add('is-active'))
	const doc = docs[index]
	document.querySelectorAll('.doc-title').forEach(element => element.innerHTML = doc.title)
    document.querySelectorAll('.doc-body').forEach(element => element.innerHTML = doc.body)
    let updatedSearchParams = new URLSearchParams(location.search)
    if (index)
        updatedSearchParams.set('i', index)
    else
        updatedSearchParams.delete('i')
    const searchParamsString = updatedSearchParams.toString()
    const newUrl = `${location.protocol}//${location.host}${location.pathname}${searchParamsString.length ? `?${searchParamsString}` : ''}`
    history.pushState({ path: newUrl }, '', newUrl)
}

const docs = [
	{
		title: 'Getting Started',
        body: `
            <h1 class="subtitle">Use the Astra Exchange <code>&lt;script&gt;</code> tag</h1>
            <p><b>Copy and paste into the <code>head</code> of your HTML file:</b></p>
            <br>
            <code>&lt;script src="https://astra.exchange/api"&gt;&lt;/script&gt;</code>
            <br><br>
            <h1 class="subtitle">For Node.js (npm)</h1>
            <p><b><a href="https://www.npmjs.com/package/astra-exchange" target="_blank">Astra Exchange on npm</a></b></p>
            <br>
            <code>npm i astra-exchange</code>
            <br>
            <hr>
            <h1 class="subtitle">Making Transactions</h1>
			<p>Using the <code>exchange.transact</code> function:</p>
            <br>
<pre>
exchange.transact('1234', 'e95Y6tKOvIS7CBlEdBn2UknzxMQ2', 'GwZX5OnFzGUl0UlXH97EGIeW70p1', 20, 'Take my money').then(() => {
    alert('Successful transaction')
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature:</b></p>
            <br>
<pre>
exchange.transact(pin: string,
                  from: string,
                  to: string,
                  amount: number,
                  message: string) // Optional or <span class="inline-code">null</span>
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes no parameters</b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
			<br>
			<a class="doc-link" onclick="selectDoc(1)">Read more</a>
            <br><br><br>
            <h1 class="subtitle">Authentication</h1>
            <p><b>Getting the current user using <code>exchange.currentUser</code></b></p>
            <br>
            <p>The current user is stored locally so you can access it on any new browser session</p>
            <br>
<pre>
// Not signed in:
console.log(exchange.currentUser)
>>> undefined

// Signed in:
console.log(exchange.currentUser)
>>> {
    id: 'e95Y6tKOvIS7CBlEdBn2UknzxMQ2',
    name: 'Ken Mueller',
    email: 'ken@adastraschool.org',
    balance: 300,
    reputation: 60,
    pin: '1234'
}
</pre>
            <br>
            <p><b>Checking if there is a user signed in using <code>exchange.isSignedIn()</code></b></p>
            <br>
            <p>A boolean value telling you if there is a user currently signed in. You can use this value to show the user different content based on whether they are signed in or not</p>
            <br>
<pre>
// Not signed in:
console.log(exchange.isSignedIn())
>>> false

// Signed in:
console.log(exchange.isSignedIn())
>>> true
</pre>
            <br>
            <p><b>Authenticate users using the <code>exchange.signIn</code> function</b></p>
            <br>
            <p>Signs in a user with their email and pin, saving their data even when the page is closed</p>
            <br>
<pre>
exchange.signIn('ken@adastraschool.org', '1234').then(user => {
    console.log(user)
    console.log(exchange.currentUser) // The current user signed in
}).catch(error => {
    // Sign in was unsuccessful, either email or pin was incorrect.
    // You should tell the user to re-enter their information if this happens.
    alert('Your email/pin was incorrect. Please try again')
    console.log(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a> with public and private data):</b></p>
            <br>
<pre>
exchange.signIn(email: string,
                pin: string)
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a> with public and private data. It also updates <code>exchange.currentUser</code></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
            <br>
            <p>After a user is successfully signed in, you can view the user's data with <code>exchange.currentUser</code></p>
            <br>
            <p><b>Sign out using the <code>exchange.signOut</code> function</b></p>
            <p>Signs out the current user and resets <code>exchange.currentUser</code> to <code>undefined</code></p>
            <br>
<pre>
// Signed in
console.log(exchange.currentUser)
>>> {...}

exchange.signOut()

console.log(exchange.currentUser)
>>> undefined
</pre>
            <br>
            <p><b>Returns nothing</b></p>
            <br>
            <p>If there is no user currently signed in, this function does nothing</p>
            <br>
            <p><b>Reloading the current user using <code>exchange.reloadCurrentUser()</code></b></p>
            <br>
            <p>Reloads the current user's data, updating <code>exchange.currentUser</code> and returning the updated user. <b>This function should be called on every webpage load, so your site keeps up with changes to the user's balance and reputation and other data.</b></p>
            <br>
<pre>
// Old user data
console.log(exchange.currentUser.balance)
>>> 150

exchange.reloadCurrentUser().then(user => {
    console.log(user.balance)
    // \`user\` and \`exchange.currentUser\` are both the same
    console.log(exchange.currentUser.balance)
}).catch(error => {
    // Uh oh, an error occurred. The user updated their email or pin and needs to sign in again.
    alert('Please sign in again')

    // Log the error
    console.log(error)
})
>>> 200
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a> with public and private data. It also updates <code>exchange.currentUser</code>. If there is no user signed in, <code>user</code> is <code>undefined</code></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code>. The catch block is typically called when the user needs to sign in again since their authentication info changed.</b></p>
            <br>
            <p><b>View an example on <a href="https://jsfiddle.net/phz65n3r/" target="_blank">jsfiddle</a></b></p>
            <br>
            <a class="doc-link" onclick="selectDoc(3)">Read more</a>
            <br><br><br>
			<h1 class="subtitle">Accessing User Data</h1>
			<p>Using the <code>exchange.userWithId</code> function (<b>IMPORTANT - </b>Set the pin as <code>null</code> or don't enter a value to only get public user data):</p>
            <br>
<pre>
exchange.userWithId('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234').then(user => {
    console.log(user)
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})

exchange.userWithId('e95Y6tKOvIS7CBlEdBn2UknzxMQ2').then(user => {
    console.log(user) // Only logs public user data since a pin was not specified
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a>):</b></p>
            <br>
<pre>
exchange.userWithId(id: string,
                    pin: string) // Optional or <span class="inline-code">null</span> if you only want public data
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
            <br>
            <p>Using the <code>exchange.userWithEmail</code> function (<b>IMPORTANT - </b>Set the pin as <code>null</code> or don't enter a value to only get public user data):</p>
            <br>
<pre>
exchange.userWithEmail('ken@adastraschool.org', '1234').then(user => {
    console.log(user)
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})

exchange.userWithEmail('ken@adastraschool.org').then(user => {
    console.log(user) // Only logs public user data since a pin was not specified
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a>):</b></p>
            <br>
<pre>
exchange.userWithEmail(id: string,
                       pin: string) // Optional or <span class="inline-code">null</span> if you only want public data
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
            <br>
            <p>Using the <code>exchange.transactions</code> function to access all of a user's transactions:</p>
            <br>
<pre>
exchange.transactions('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234').then(transactions => {
    console.log(transactions)
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (transactions is a list of <a onclick="selectDoc(2)">transaction objects</a>):</b></p>
            <br>
<pre>
exchange.transactions(id: string,
                      pin: string)
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a list of <a onclick="selectDoc(2)">transaction objects</a></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
            <br>
            <a class="doc-link" onclick="selectDoc(2)">Read more</a>
            <br><br><br>
            <h1 class="subtitle">Retrieving all Users</h1>
			<p>Using the <code>exchange.users</code> function (<b>NOTE - </b>Returns only public user data):</p>
            <br>
<pre>
exchange.users().then(users => {
    console.log(users) // Only public user data
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (users is a list of <a onclick="selectDoc(2)">user objects</a> with only public data):</b></p>
            <br>
<pre>
exchange.users()
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a list of <a onclick="selectDoc(2)">user objects</a> with only public data</b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
            <br>
            <a class="doc-link" onclick="selectDoc(4)">Read more</a>
		`
	},
	{
		title: 'Making Transactions',
		body: `
			<h1 class="subtitle">Using the <code>exchange.transact</code> function</h1>
<pre>
exchange.transact('1234', 'e95Y6tKOvIS7CBlEdBn2UknzxMQ2', 'GwZX5OnFzGUl0UlXH97EGIeW70p1', 20, 'Take my money').then(() => {
    alert('Successful transaction')
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature:</b></p>
            <br>
<pre>
exchange.transact(pin: string,
                  from: string,
                  to: string,
                  amount: number,
                  message: string) // Optional or <span class="inline-code">null</span>
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes no parameters</b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
			<br>
            <p>First parameter: the user's pin (must be a string).</p>
            <br>
            <p>Second: the sender's ID.</p>
            <br>
            <p>Third: the recipient's ID.</p>
            <br>
            <p>Fourth: the amount (must be an number).</p>
            <br>
            <p>Fifth: the message (Don't pass in a message if you don't have one, or pass in <code>null</code>).</p>
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
		title: 'Getting User Data',
		body: `
            <h1 class="subtitle">Using the <code>exchange.userWithId</code> function</h1>
<pre>
exchange.userWithId('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234').then(user => {
    console.log(user)
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})

exchange.userWithId('e95Y6tKOvIS7CBlEdBn2UknzxMQ2').then(user => {
    console.log(user) // Only logs public user data since a pin was not specified
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a>):</b></p>
            <br>
<pre>
exchange.userWithId(id: string,
                    pin: string) // Optional or <span class="inline-code">null</span> if you only want public data
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
			<br>
            <p>First parameter: the user's ID.</p>
            <br>
            <p>Second: the user's pin. (Don't pass in a pin or make it <code>null</code> to only receive public data)</p>
            <br>
            <h1 class="subtitle">Possible errors</h1>
            <p><b>400:</b> Invalid parameters</p>
            <p><b>404:</b> Invalid user ID</p>
            <p><b>401:</b> Invalid pin</p>
            <p><b>500:</b> Unknown error. Please try again</p>
            <br>
            <h1 class="subtitle">User Object</h1>
            <p><b>Public fields:</b></p>
            <br>
            <p><b>id:</b> string</p>
            <p><b>name:</b> string</p>
            <p><b>email:</b> string</p>
            <p><b>balance:</b> number</p>
            <br>
            <p><b>Private fields (must specify pin):</b></p>
            <br>
            <p><b>id:</b> string</p>
            <p><b>name:</b> string</p>
            <p><b>email:</b> string</p>
            <p><b>balance:</b> number</p>
            <p><b>reputation:</b> number</p>
            <p><b>pin:</b> string (length is 4)</p>
            <br>
            <h1 class="subtitle">Using the <code>exchange.userWithEmail</code> function</h1>
<pre>
exchange.userWithEmail('ken@adastraschool.org', '1234').then(user => {
    console.log(user)
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})

exchange.userWithEmail('ken@adastraschool.org').then(user => {
    console.log(user) // Only logs public user data since a pin was not specified
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a>):</b></p>
            <br>
<pre>
exchange.userWithEmail(id: string,
                       pin: string) // Optional or <span class="inline-code">null</span> if you only want public data
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
			<br>
            <p>First parameter: the user's email.</p>
            <br>
            <p>Second: the user's pin. Don't pass in a pin or make it <code>null</code> to only receive public data)</p>
            <br>
            <h1 class="subtitle">Possible errors</h1>
            <p><b>400:</b> Invalid parameters</p>
            <p><b>404:</b> Invalid email</p>
            <p><b>401:</b> Invalid pin</p>
            <p><b>500:</b> Unknown error. Please try again</p>
            <br>
            <h1 class="subtitle">Using the <code>exchange.transactions</code> function</h1>
            <p>Returns the entire transaction history of the specified user</p>
            <br>
<pre>
exchange.transactions('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234').then(transactions => {
    console.log(transactions)
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (transactions is a list of <a onclick="selectDoc(2)">transaction objects</a>):</b></p>
            <br>
<pre>
exchange.transactions(id: string,
                      pin: string)
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a list of <a onclick="selectDoc(2)">transaction objects</a></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
			<br>
            <p>First parameter: the user's ID.</p>
            <br>
            <p>Second: the user's pin. (<b>cannot</b> be <code>null</code>)</p>
            <br>
            <h1 class="subtitle">Possible errors</h1>
            <p><b>400:</b> Invalid parameters</p>
            <p><b>404:</b> Invalid user ID</p>
            <p><b>401:</b> Invalid pin</p>
            <p><b>500:</b> Unknown error. Please try again</p>
            <br>
            <h1 class="subtitle">Transaction Object</h1>
            <p><b>id:</b> string</p>
            <p><b>time:</b> Date</p>
            <p><b>from:</b> string (sender's user ID)</p>
            <p><b>to:</b> string (recipient's user ID)</p>
            <p><b>amount:</b> number (how much money is being sent)</p>
            <p><b>balance:</b> number (the new balance of the user after applying this transaction)</p>
            <p><b>message:</b> string (can be blank)</p>
		`
    },
    {
        title: 'Authentication',
        body: `
            <h1 class="subtitle">Getting the current user using <code>exchange.currentUser</code></h1>
            <p>The current user is stored locally so you can access it on any new browser session</p>
            <br>
<pre>
// Not signed in:
console.log(exchange.currentUser)
>>> undefined

// Signed in:
console.log(exchange.currentUser)
>>> {
    id: 'e95Y6tKOvIS7CBlEdBn2UknzxMQ2',
    name: 'Ken Mueller',
    email: 'ken@adastraschool.org',
    balance: 300,
    reputation: 60,
    pin: '1234'
}
</pre>
            <br>
            <h1 class="subtitle">Checking if there is a user signed in using <code>exchange.isSignedIn()</code></h1>
            <p>A boolean value telling you if there is a user currently signed in. You can use this value to show the user different content based on whether they are signed in or not</p>
            <br>
<pre>
// Not signed in:
console.log(exchange.isSignedIn())
>>> false

// Signed in:
console.log(exchange.isSignedIn())
>>> true
</pre>
            <br>
            <h1 class="subtitle">Authenticate users using the <code>exchange.signIn</code> function</h1>
            <p>Signs in a user with their email and pin, saving their data even when the page is closed</p>
            <br>
<pre>
exchange.signIn('ken@adastraschool.org', '1234').then(user => {
    console.log(user)
    console.log(exchange.currentUser) // The current user signed in
}).catch(error => {
    // Sign in was unsuccessful, either email or pin was incorrect.
    // You should tell the user to re-enter their information if this happens.
    alert('Your email/pin was incorrect. Please try again')
    console.log(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
        <br>
        <p><b>Type signature (user is a <a onclick="selectDoc(2)">user object</a> with public and private data):</b></p>
        <br>
<pre>
exchange.signIn(email: string,
                pin: string)
</pre>
        <br>
        <p><b>Returns a <code>Promise</code></b></p>
        <br>
        <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a> with public and private data. It also updates <code>exchange.currentUser</code></b></p>
        <br>
        <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
        <br>
        <p>After a user is successfully signed in, you can view the user's data with <code>exchange.currentUser</code></p>
        <br>
        <h1 class="subtitle">Sign out using the <code>exchange.signOut</code> function</h1>
        <p>Signs out the current user and resets <code>exchange.currentUser</code> to <code>undefined</code></p>
        <br>
<pre>
// Signed in
console.log(exchange.currentUser)
>>> {...}

exchange.signOut()

console.log(exchange.currentUser)
>>> undefined
</pre>
        <br>
        <p><b>Returns nothing</b></p>
        <br>
        <p>If there is no user currently signed in, this function does nothing</p>
        <br>
        <h1 class="subtitle">Reloading the current user using <code>exchange.reloadCurrentUser()</code></h1>
        <p>Reloads the current user's data, updating <code>exchange.currentUser</code> and returning the updated user. <b>This function should be called on every webpage load, so your site keeps up with changes to the user's balance and reputation and other data.</b></p>
        <br>
<pre>
// Old user data
console.log(exchange.currentUser.balance)
>>> 150

exchange.reloadCurrentUser().then(user => {
    console.log(user.balance)
    // \`user\` and \`exchange.currentUser\` are both the same
    console.log(exchange.currentUser.balance)
}).catch(error => {
    // Uh oh, an error occurred. The user updated their email or pin and needs to sign in again.
    alert('Please sign in again')

    // Log the error
    console.log(error)
})
>>> 200
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a <a onclick="selectDoc(2)">user object</a> with public and private data. It also updates <code>exchange.currentUser</code>. If there is no user signed in, <code>user</code> is <code>undefined</code></b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code>. The catch block is typically called when the user needs to sign in again since their authentication info changed.</b></p>
            <br>
            <h1 class="subtitle">Example</h1>
<pre>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
    &lt;head&gt;
        &lt;script src="https://astra.exchange/api"&gt;&lt;/script&gt;
        &lt;title&gt;Example&lt;/title&gt;
    &lt;/head&gt;
    &lt;body&gt;
        &lt;h1&gt;Sign in&lt;/h1&gt;
        &lt;input id="email-input" type="email" placeholder="Enter your email"&gt;
        &lt;br&gt;
        &lt;input id="pin-input" type="password" placeholder="Enter your pin"&gt;
        &lt;br&gt;&lt;br&gt;
        &lt;button onclick="signIn()"&gt;Sign in&lt;/button&gt;
        &lt;script&gt;
            function signIn() {
                // Getting the email and pin
                const email = document.getElementById('email-input').value
                const pin = document.getElementById('pin-input').value

                // Signing the user in
                exchange.signIn(email, pin).then(user =&gt; {
                    // Successful sign in

                    // Alert the user's name
                    alert(\`Your name is \${user.name}\`)

                    // Log the rest of the user's data. \`user\` and \`exchange.currentUser\` are the same
                    console.log(exchange.currentUser)
                }).catch(error =&gt; {
                    // Unsuccessful sign in

                    // Alert the user that their information was incorrect
                    alert('Your email/pin was incorrect. Please try again')
                    
                    // Log the error so we can see exactly what error it was
                    console.log(\`status: \${error.status}, message: \${error.message}\`)
                })
            }
        &lt;/script&gt;
    &lt;/body&gt;
&lt;/html&gt;
</pre>
            <br>
            <p><b>View the example on <a href="https://jsfiddle.net/phz65n3r/" target="_blank">jsfiddle</a></b></p>
        `
    },
	{
		title: 'Retrieving all Users',
		body: `
            <h1 class="subtitle">Using the <code>exchange.users</code> function</h1>
            <p>Returns every user's public data</p>
            <br>
<pre>
exchange.users().then(users => {
    console.log(users) // Only public user data
}).catch(error => {
    alert(\`status: \${error.status}, message: \${error.message}\`)
})
</pre>
            <br>
            <p><b>Type signature (users is a list of <a onclick="selectDoc(2)">user objects</a> with only public data):</b></p>
            <br>
<pre>
exchange.users()
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a list of <a onclick="selectDoc(2)">user objects</a> with only public data</b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
            <br>
            <h1 class="subtitle">User Object</h1>
            <p><b>Public fields (if you want private fields, you must <a onclick="selectDoc(2)">get each user individually</a>):</b></p>
            <br>
            <p><b>id:</b> string</p>
            <p><b>name:</b> string</p>
            <p><b>email:</b> string</p>
            <p><b>balance:</b> number</p>
		`
	}
]