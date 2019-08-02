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
		document.querySelectorAll('.settings.independence').forEach(element => element.innerHTML = user.independence === 0 ? 'Pending' : user.independence)
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

function tryItSignIn() {
    fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/user?email=${document.getElementById('try-it-email').value}&pin=${document.getElementById('try-it-pin').value}`).then(response => {
        switch (response.status) {
            case 200:
                return response.json().then(json =>
                    alert(`Hello, ${json.name}`)
                )
            case 400:
                alert('Invalid parameters')
                break
            case 404:
                alert('Invalid email')
                break
            case 401:
                alert('Invalid pin')
                break
            default:
                alert('Unknown error. Please try again')
        }
    })
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
                  message: string) // Optional or <span style="color: red;">null</span>
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
                    pin: string) // Optional or <span style="color: red;">null</span> if you only want public data
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
                       pin: string) // Optional or <span style="color: red;">null</span> if you only want public data
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
})
</pre>
            <br>
            <p><b>Type signature (users is a list of <a onclick="selectDoc(3)">user objects</a> with only public data):</b></p>
            <br>
<pre>
exchange.users()
</pre>
            <br>
            <p><b>Returns a <code>Promise</code></b></p>
            <br>
            <p><b>The <code>.then</code> block takes a list of <a onclick="selectDoc(3)">user objects</a> with only public data</b></p>
            <br>
            <p><b>The <code>.catch</code> block takes an error of type <code>{ status: number, message: string }</code></b></p>
            <br>
            <a class="doc-link" onclick="selectDoc(3)">Read more</a>
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
                  message: string) // Optional or <span style="color: red;">null</span>
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
		title: 'Authentication & User Data',
		body: `
            <h1 class="subtitle">Using the <code>exchange.userWithId</code> function</h1>
<pre>
exchange.userWithId('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234', user => {
    console.log(user)
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <b>user object</b>):</b></p>
            <br>
<pre>
userWithId(id: string,
           pin: string|null,
           success: (user: any[]) => void,
           failure: (status: int, response: string) => void)
</pre>
			<br>
            <p>First parameter: the user's ID.</p>
            <br>
            <p>Second: the user's pin. (make it <code>null</code> to only receive public data)</p>
            <br>
            <p>Third: (the first function): The success function. This function is called if the user was gotten successfully. It takes in a <b>user object</b> (will see shortly)</p>
            <br>
            <p>Seventh (last parameter): The error function. This function is called if there was an error when the user was gotten. It takes in 2 inputs, the first one being the error code (status), and the second being the error message (SEE BELOW).</p>
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
            <p><b>id</b> string</p>
            <p><b>name</b> string</p>
            <p><b>email</b> string</p>
            <p><b>balance</b> number</p>
            <br>
            <p><b>Private fields (must specify pin):</b></p>
            <br>
            <p><b>id</b> string</p>
            <p><b>name</b> string</p>
            <p><b>email</b> string</p>
            <p><b>balance</b> number</p>
            <p><b>independence</b> number (between 0-3, 0 means pending)</p>
            <p><b>pin</b> string (length is 4)</p>
            <br>
            <h1 class="subtitle">Using the <code>exchange.userWithEmail</code> function</h1>
<pre>
exchange.userWithEmail('ken@adastraschool.org', '1234', user => {
    console.log(user)
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature (user is a <b>user object</b>):</b></p>
            <br>
<pre>
userWithEmail(email: string,
              pin: string|null,
              success: (user: any[]) => void,
              failure: (status: int, response: string) => void)
</pre>
			<br>
            <p>First parameter: the user's email.</p>
            <br>
            <p>Second: the user's pin. (make it <code>null</code> to only receive public data)</p>
            <br>
            <p>Third: (the first function): The success function. This function is called if the user was gotten successfully. It takes in a <b>user object</b> (see above)</p>
            <br>
            <p>Seventh (last parameter): The error function. This function is called if there was an error when the user was gotten. It takes in 2 inputs, the first one being the error code (status), and the second being the error message (SEE BELOW).</p>
            <br>
            <h1 class="subtitle">Possible errors</h1>
            <p><b>400:</b> Invalid parameters</p>
            <p><b>404:</b> Invalid email</p>
            <p><b>401:</b> Invalid pin</p>
            <p><b>500:</b> Unknown error. Please try again</p>
            <br>
            <h1 class="title">User Authentication</h1>
            <p>When a user tries to sign in, run this code (edit accordingly)</p>
            <br>
<pre>
function authenticate(email, pin) {
    exchange.userWithEmail(email, pin, user => {
        // Sign in successful
        location.href = '/dashboard'
    }, (status, response) => {
        alert(response)
    })
}
</pre>
            <br>
            <h1 class="subtitle">Try it</h1>
            <div class="field">
                <div class="control">
                    <input class="input" id="try-it-email" type="email" placeholder="Enter your email">
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <input class="input" id="try-it-pin" type="password" placeholder="Enter your pin">
                </div>
            </div>
            <a class="button is-info" onclick="tryItSignIn()"><strong>Sign in</strong></a>
            <br><br>
            <h1 class="title">Sample code</h1>
<pre>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
    &lt;head&gt;
        &lt;script src="https://astra.exchange/api"&gt;&lt;/script&gt;
        &lt;title&gt;Document&lt;/title&gt;
    &lt;/head&gt;
    &lt;body&gt;
        &lt;h1&gt;Sign in&lt;/h1&gt;
        &lt;input class="input" id="email-input" type="email" placeholder="Enter your email"&gt;
        &lt;br&gt;
        &lt;input class="input" id="pin-input" type="password" placeholder="Enter your pin"&gt;
        &lt;br&gt;&lt;br&gt;
        &lt;button onclick="authenticate(document.getElementById('email-input').value, document.getElementById('pin-input').value)"&gt;Sign in&lt;/button&gt;
        &lt;script&gt;
            function authenticate(email, pin) {
                exchange.userWithEmail(email, pin, user =&gt; {
                    alert(\`Hello, \${user.name}\`)
                }, (status, response) =&gt; {
                    alert(response)
                })
            }
        &lt;/script&gt;
    &lt;/body&gt;
&lt;/html&gt;
</pre>
            <br>
            <h1 class="subtitle">Using the <code>exchange.transactions</code> function</h1>
            <p>Returns the entire transaction history of the specified user</p>
            <br>
<pre>
exchange.transactions('e95Y6tKOvIS7CBlEdBn2UknzxMQ2', '1234', transactions => {
    console.log(transactions)
}, (status, response) => {
    alert(\`\${status} error: \${response}\`)
})
</pre>
            <br>
            <p><b>Type signature (transactions is a list of <b>transaction objects</b>):</b></p>
            <br>
<pre>
transactions(id: string,
             pin: string,
             success: (transactions: any[]) => void,
             failure: (status: int, response: string) => void)
</pre>
			<br>
            <p>First parameter: the user's ID.</p>
            <br>
            <p>Second: the user's pin. (<b>cannot</b> be <code>null</code>)</p>
            <br>
            <p>Third: (the first function): The success function. This function is called if the user was gotten successfully. It takes in a list of <b>transaction objects</b> (see below)</p>
            <br>
            <p>Seventh (last parameter): The error function. This function is called if there was an error when the transactions was gotten. It takes in 2 inputs, the first one being the error code (status), and the second being the error message (SEE BELOW).</p>
            <br>
            <h1 class="subtitle">Possible errors</h1>
            <p><b>400:</b> Invalid parameters</p>
            <p><b>404:</b> Invalid user ID</p>
            <p><b>401:</b> Invalid pin</p>
            <p><b>500:</b> Unknown error. Please try again</p>
            <br>
            <h1 class="subtitle">Transaction Object</h1>
            <p><b>Fields:</b></p>
            <br>
            <p><b>id</b> string</p>
            <p><b>time</b> string (date created as a string)</p>
            <p><b>from</b> string (user ID)</p>
            <p><b>to</b> string (user ID)</p>
            <p><b>amount</b> number (how much money is being sent)</p>
            <p><b>balance</b> number (the new balance of the user after applying this transaction)</p>
            <p><b>message</b> string (can be blank)</p>
		`
	},
	{
		title: 'Retrieve all Users',
		body: `
            <h1 class="subtitle">Using the <code>exchange.users</code> function</h1>
            <p>Returns every user's public data</p>
            <br>
<pre>
exchange.users(users => {
    console.log(users)
})
</pre>
            <br>
            <p><b>Type signature (users is a list of <b>user objects</b>):</b></p>
            <br>
<pre>
users(completion: (users: any[]) => void)
</pre>
            <br>
            <p>Only parameter: The completion function. It takes in a list of <b>user objects</b> (see below).</p>
            <br>
            <h1 class="subtitle">User Object</h1>
            <p><b>Public fields (if you want private fields, you must <a onclick="selectDoc(2)">get each user individually</a>):</b></p>
            <br>
            <p><b>id</b> string</p>
            <p><b>name</b> string</p>
            <p><b>email</b> string</p>
            <p><b>balance</b> number</p>
		`
	}
]