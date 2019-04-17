exports.users = completion =>
	fetch('https://us-central1-astra-exchange.cloudfunctions.net/users').then(response => {
		if (response.readyState === 4)
			return response.json().then(json =>
				completion(JSON.parse(json))
			)
	})

exports.transact = (pin, from, to, amount, message, success, failure) =>
    fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/transact?pin=${pin}&from=${from}&to=${to}&amount=${amount}${message ? `&message=${message}` : ''}`).then(response => {
        if (response.readyState === 4)
            switch (response.status) {
                case 200:
                    success()
                    break
                case 400:
                    failure(400, 'Invalid parameters')
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
	})

exports.userWithId = (id, pin, success, failure) =>
	fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/user?id=${id}${pin ? `&pin=${pin}` : ''}`).then(response => {
		if (response.readyState === 4)
			switch (response.status) {
				case 200:
					return response.json().then(json =>
						success(JSON.parse(json))
					)
				case 400:
					failure(400, 'Invalid parameters')
					break
				case 404:
					failure(404, 'Invalid user ID')
					break
				case 401:
					failure(401, 'Invalid pin')
					break
				default:
					failure(500, 'Unknown error. Please try again')
			}
	})

exports.userWithEmail = (email, pin, success, failure) =>
	fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/user?email=${email}${pin ? `&pin=${pin}` : ''}`).then(response => {
		if (response.readyState === 4)
			switch (response.status) {
				case 200:
					return response.json().then(json =>
						success(JSON.parse(json))
					)
				case 400:
					failure(400, 'Invalid parameters')
					break
				case 404:
					failure(404, 'Invalid email')
					break
				case 401:
					failure(401, 'Invalid pin')
					break
				default:
					failure(500, 'Unknown error. Please try again')
			}
	})

exports.transactions = (id, pin, success, failure) =>
	fetch(`https://cors-anywhere.herokuapp.com/https://us-central1-astra-exchange.cloudfunctions.net/transactions?id=${id}&pin=${pin}`).then(response => {
		if (response.readyState === 4)
			switch (response.status) {
				case 200:
					return response.json().then(json =>
						success(JSON.parse(json))
					)
				case 400:
					failure(400, 'Invalid parameters')
					break
				case 404:
					failure(404, 'Invalid user ID')
					break
				case 401:
					failure(401, 'Invalid pin')
					break
				default:
					failure(500, 'Unknown error. Please try again')
			}
	})