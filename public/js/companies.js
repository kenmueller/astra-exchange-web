document.addEventListener('DOMContentLoaded', () => {
	const auth = firebase.auth()
	const db = firebase.database()
	let user
	let companies = []
	let cart = []

	const authCookie = document.cookie.match('(^|[^;]+)\\s*auth\\s*=\\s*([^;]+)')
    if (authCookie) {
		const name = authCookie.pop()
		document.querySelectorAll('.user.name').forEach(element => element.innerHTML = name)
        document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = name)
        document.querySelectorAll('.auth.user-dropdown').forEach(element => element.classList.remove('is-hidden'))
    }

	auth.onAuthStateChanged(user_ => {
		if (user_) {
			const id = user_.uid
			db.ref(`users/${id}`).on('value', snapshot => {
				const val = snapshot.val()
				user = {id, name: val.name, email: val.email, balance: val.balance, reputation: val.reputation, card: null }
				document.querySelectorAll('.auth.user-link').forEach(element => element.innerHTML = user.name)
				document.querySelectorAll('.user.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
				updateSettings()
				db.ref(`users/${id}/cards`).on('child_added', cardSnapshot => {
					const cardVal = cardSnapshot.val()
					user.card = { id: cardSnapshot.key, name: cardVal.name, pin: cardVal.pin }
					updateSettings()
				})
			})
			db.ref('companies').on('child_added', snapshot => {
				const companyId = snapshot.key
				const val = snapshot.val()
				db.ref(`users/${val.owner}`).on('value', userSnapshot => {
					const userVal = userSnapshot.val()
					const company = { id: companyId, image: val.image ? val.image : '/images/astra.png', name: val.name, owner: { id: userSnapshot.key, name: userVal.name, email: userVal.email, balance: userVal.balance }, description: val.description, products: [] }
					companies.push(company)
					updateCompanies()
					db.ref(`products/${companyId}`).on('child_added', productSnapshot => {
						const productVal = productSnapshot.val()
						company.products.push({ id: productSnapshot.key, image: productVal.image, name: productVal.name, price: productVal.price })
						updateCompanies()
					})
				})
			})
			db.ref(`carts/${id}`).on('child_added', snapshot => {
				const val = snapshot.val()
				cart.push({ product: snapshot.key, company: val.company, quantity: val.quantity })
				updateCart()
			})
		} else {
			document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
			history.back()
		}
	})

	function updateSettings() {
		document.querySelectorAll('.settings.name').forEach(element => element.innerHTML = user.name)
		document.querySelectorAll('.settings.email').forEach(element => element.innerHTML = user.email)
		document.querySelectorAll('.settings.balance').forEach(element => element.innerHTML = Math.trunc(user.balance * 100) / 100)
		document.querySelectorAll('.settings.reputation').forEach(element => element.innerHTML = user.reputation)
		if (user.card) document.querySelectorAll('.settings.pin').forEach(element => element.innerHTML = user.card.pin)
	}

	function updateCompanies() {
		document.querySelectorAll('.column.companies').forEach(element => removeAllNodes(element))
		for (company_ in companies) {
			const companyIndex = parseInt(company_)
			const company = companies[companyIndex]
			const div = document.createElement('div')
			div.className = 'card company'
			div.innerHTML = `
				<a href="/companies/${company.name.trim().replace(/[\s.]+/g, '-').toLowerCase()}">
					<div class="card-image">
						<figure class="image">
							<img src="${company.image}" alt="Company image" class="company-card image">
						</figure>
					</div>
					<div class="card-content">
						<div class="media">
							<div class="media-content">
								<p class="title is-4 company-card name">${company.name}</p>
								<p class="subtitle is-6 company-card owner">${company.owner.name}</p>
							</div>
						</div>
						<div class="content">
							<hr>
							<p class="company-card description">${company.description}</p>
							<br><br>
							<p class="company-card products">${company.products.length} Product${company.products.length === 1 ? '' : 's'}</p>
						</div>
					</div>
				</a>
			`
			document.querySelector(`.column.companies-${companyIndex % 4 + 1}`).appendChild(div)
		}
	}

	function updateCart() {
		
	}

	function completeNewCompany() {
		const files = document.getElementById('newcommitfile').files
		if (newCommitMessage !== undefined && selectedRepository !== undefined && files.length !== 0) {
			const publishCommitButton = document.getElementById('publishnewcommit')
			publishCommitButton.classList.add('is-loading')
			const commitVersion = document.getElementById('commitversion').value.trim()
			const currentRepository = repositories[selectedRepository]
			const generatedCommitVersion = commitVersion.length === 0 ? currentRepository.version : commitVersion
			const commitRef = db.collection('users').doc(user.uid).collection('repositories').doc(currentRepository.id).collection('commits').add({ time: new Date(), message: newCommitMessage, version: generatedCommitVersion })
			db.collection('users').doc(user.uid).collection('repositories').doc(currentRepository.id).update({ version: generatedCommitVersion })
			storage.child(`users/${user.uid}/repositories/${currentRepository.id}/commits/${commitRef.id}`).put(files[0]).then(function(_snapshot) {
				publishCommitButton.classList.remove('is-loading')
				closeNewCommitModal()
				newCommitMessage = null
			})
		}
	}

	function removeAllNodes(element) {
		while (element.firstChild)
			element.removeChild(element.firstChild)
	}

	function resetAllInputs() {
		document.querySelectorAll('.input').forEach(element => element.value = '')
		document.querySelectorAll('.button.complete').forEach(element => element.disabled = true)
	}

	function resetPassword() {
		auth.sendPasswordResetEmail(user.email)
		alert(`Password reset email sent to ${user.email}`)
	}

	function showModal(modal) {
		document.querySelectorAll(`.modal.${modal}`).forEach(element => element.classList.add('is-active'))
	}

	function hideModal(modal) {
		document.querySelectorAll(`.modal.${modal}`).forEach(element => element.classList.remove('is-active'))
	}

	function showNewCompanyModal() {
		showModal('new-company')
	}

	function hideNewCompanyModal() {
		hideModal('new-company')
		resetAllInputs()
	}

	document.querySelectorAll('.button.password-reset').forEach(element => element.addEventListener('click', resetPassword))
	document.querySelectorAll('.action.new-company').forEach(element => element.addEventListener('click', showNewCompanyModal))
	document.querySelectorAll('.close-new-company').forEach(element => element.addEventListener('click', hideNewCompanyModal))
	document.querySelectorAll('.button.complete-new-company').forEach(element => element.addEventListener('click', completeNewCompany))
})