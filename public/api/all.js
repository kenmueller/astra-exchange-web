const exchange = (function() {
	const USER_COOKIE = '__astra-exchange-user'

	const getCookie = name => {
		const cookies = document.cookie.match(`(^|[^;]+)\\s*${name}\\s*=\\s*([^;]+)`)
		return cookies ? cookies.pop() : undefined
	}

	const setCookie = (name, value) =>
		document.cookie = `${name}=${value}; expires=Thu, 01 Jan 3000 00:00:00 GMT`

	const removeCookie = name =>
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`

	const getCurrentUser = () => {
		const user = getCookie(USER_COOKIE)
		return user ? JSON.parse(user) : undefined
	}

	this.currentUser = getCurrentUser()

	this.users = () =>
		fetch('https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/users').then(response =>
			response.json().catch(() =>
				Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
			)
		)

	this.transact = (pin, from, to, amount, message = undefined) =>
		fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=${pin}&from=${from}&to=${to}&amount=${amount}${message ? `&message=${message}` : ''}`).then(response => {
			switch (response.status) {
			case 200:
				return Promise.resolve()
			case 400:
				return Promise.reject({ status: 400, message: 'Invalid parameters' })
			case 404:
				return Promise.reject({ status: 404, message: 'Invalid user ID' })
			case 403:
				return Promise.reject({ status: 403, message: 'Insufficient balance' })
			case 401:
				return Promise.reject({ status: 401, message: 'Invalid pin' })
			default:
				return Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
			}
		})

	this.userWithId = (id, pin = undefined) =>
		fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/user?id=${id}${pin ? `&pin=${pin}` : ''}`).then(response => {
			switch (response.status) {
			case 200:
				return response.json().catch(() =>
					Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
				)
			case 400:
				return Promise.reject({ status: 400, message: 'Invalid parameters' })
			case 404:
				return Promise.reject({ status: 404, message: 'Invalid user ID' })
			case 401:
				return Promise.reject({ status: 401, message: 'Invalid pin' })
			default:
				return Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
			}
		})

	this.userWithEmail = (email, pin = undefined) =>
		fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/user?email=${email}${pin ? `&pin=${pin}` : ''}`).then(response => {
			switch (response.status) {
			case 200:
				return response.json().catch(() =>
					Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
				)
			case 400:
				return Promise.reject({ status: 400, message: 'Invalid parameters' })
			case 404:
				return Promise.reject({ status: 404, message: 'Invalid email' })
			case 401:
				return Promise.reject({ status: 401, message: 'Invalid pin' })
			default:
				return Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
			}
		})

	this.transactions = (id, pin) =>
		fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/transactions?id=${id}&pin=${pin}`).then(response => {
			switch (response.status) {
			case 200:
				return response.json().catch(() =>
					Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
				)
			case 400:
				return Promise.reject({ status: 400, message: 'Invalid parameters' })
			case 404:
				return Promise.reject({ status: 404, message: 'Invalid user ID' })
			case 401:
				return Promise.reject({ status: 401, message: 'Invalid pin' })
			default:
				return Promise.reject({ status: 500, message: 'Unknown error. Please try again' })
			}
		})

	this.isSignedIn = () =>
		(currentUser || getCookie(USER_COOKIE)) !== undefined

	this.signIn = (email, pin) =>
		userWithEmail(email, pin).then(user => {
			setCookie(USER_COOKIE, JSON.stringify(user))
			return currentUser = user
		})

	this.signOut = () => {
		removeCookie(USER_COOKIE)
		currentUser = undefined
	}

	return this
})()