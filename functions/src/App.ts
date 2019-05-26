import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'

const db = admin.database()
const expressApp = express()

export const app = functions.https.onRequest(expressApp)

expressApp.get('/users/:slug', (req, res) =>
	db.ref(`slugs/users/${req.params.slug}`).on('value', snapshot =>
		db.ref(`users/${snapshot!.val()}`).on('value', userSnapshot => {
			if (userSnapshot!.exists()) {
				const val = userSnapshot!.val()
				return res.status(200).send(`
					<!DOCTYPE html>
					<html>
						<head>
							<meta charset="utf-8">
							<meta name="viewport" content="width=device-width, initial-scale=1">
							<script defer src="/__/firebase/5.9.4/firebase-app.js"></script>
							<script defer src="/__/firebase/5.9.4/firebase-auth.js"></script>
							<script defer src="/__/firebase/5.9.4/firebase-database.js"></script>
							<script defer src="/__/firebase/5.9.4/firebase-messaging.js"></script>
							<script defer src="/__/firebase/5.9.4/firebase-storage.js"></script>
							<script defer src="/__/firebase/init.js"></script>
							<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css">
							<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
							<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
							<link rel="stylesheet" href="/css/navbar.css">
							<link rel="stylesheet" href="/css/user.css">
							<link rel="icon" type="image/png" href="/images/astra.png">
							<title>${val.name} - Astra Exchange</title>
						</head>
						<body>
							<nav class="navbar" role="navigation" aria-label="main navigation">
								<div class="navbar-brand">
									<a class="navbar-item" href="/"><img src="/images/astra.png" width="28" height="28"></a>
									<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
										<span aria-hidden="true"></span>
										<span aria-hidden="true"></span>
										<span aria-hidden="true"></span>
									</a>
								</div>
								<div id="navbar" class="navbar-menu">
									<div class="navbar-start">
										<a class="navbar-item" href="/companies">Companies</a>
										<a class="navbar-item" href="/documentation">API Documentation</a>
										<div class="navbar-item has-dropdown is-hoverable">
											<a class="navbar-link">iOS Apps</a>
											<div class="navbar-dropdown">
												<a class="navbar-item" href="itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist">Astra Exchange</a>
												<a class="navbar-item" onclick="alert('Coming soon!')">Notes Exchange</a>
											</div>
										</div>
									</div>
									<div class="navbar-end">
										<div class="navbar-item">
											<a class="button is-primary auth sign-up is-hidden">Sign up</a>
											<a class="button is-info auth sign-in is-hidden">Sign in</a>
											<div class="navbar-item has-dropdown is-hoverable auth user-dropdown is-hidden">
												<a class="navbar-link auth user-link"></a>
												<div class="navbar-dropdown">
													<a class="navbar-item action settings">Settings</a>
													<hr class="navbar-divider">
													<a class="navbar-item auth sign-out">Sign out</a>
												</div>
											</div>
										</div>
									</div>
								</div>
							</nav>
							<div class="modal settings">
								<div class="modal-background close-settings"></div>
								<div class="modal-card">
									<header class="modal-card-head">
										<p class="modal-card-title">Settings</p>
										<button class="delete close-settings" aria-label="close"></button>
									</header>
									<section class="modal-card-body">
										<div class="field">
											<label class="label">Name</label>
											<p class="settings name"></p>
										</div>
										<div class="field">
											<label class="label">Email</label>
											<p class="settings email"></p>
										</div>
										<div class="field">
											<label class="label">Balance</label>
											<p class="settings balance"></p>
										</div>
										<div class="field">
											<label class="label">Independence</label>
											<p class="settings independence"></p>
										</div>
										<div class="field">
											<label class="label">Pin</label>
											<p class="settings pin">...</p>
										</div>
									</section>
									<footer class="modal-card-foot">
										<a class="button is-primary password-reset"><strong>Send a password reset email</strong></a>
									</footer>
								</div> 
							</div>
							<h1>Name: ${val.name}</h1>
							<br>
							<h2>Email: ${val.email}</h2>
							<br>
							<p>Balance: ${val.balance}</p>
							<script src="/js/company.js"></script>
							<script src="/js/base.js"></script>
							<script>
								user({ id: '${val.key}', name: '${val.name}', email: '${val.email}', balance: '${val.balance}' })
							</script>
						</body>
					</html>
				`)
			} else return res.status(404).redirect('/users')
		})
	)
)

expressApp.get('/companies/:slug', (req, res) =>
	db.ref(`slugs/companies/${req.params.slug}`).on('value', snapshot =>
		db.ref(`companies/${snapshot!.val()}`).on('value', companySnapshot => {
			if (companySnapshot!.exists()) {
				const val = companySnapshot!.val()
				const image = val.image ? val.image : '/images/astra.png'
				return db.ref(`users/${val.owner}`).on('value', userSnapshot => {
					const userVal = userSnapshot!.val()
					return res.status(200).send(`
						<!DOCTYPE html>
						<html>
							<head>
								<meta charset="utf-8">
								<meta name="viewport" content="width=device-width, initial-scale=1">
								<script defer src="/__/firebase/5.9.4/firebase-app.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-auth.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-database.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-messaging.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-storage.js"></script>
								<script defer src="/__/firebase/init.js"></script>
								<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css">
								<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
								<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
								<link rel="stylesheet" href="/css/navbar.css">
								<link rel="stylesheet" href="/css/company.css">
								<link rel="icon" type="image/png" href="${image}">
								<title>${val.name} - Astra Exchange</title>
							</head>
							<body>
								<nav class="navbar" role="navigation" aria-label="main navigation">
									<div class="navbar-brand">
										<a class="navbar-item" href="/"><img src="/images/astra.png" width="28" height="28"></a>
										<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
											<span aria-hidden="true"></span>
											<span aria-hidden="true"></span>
											<span aria-hidden="true"></span>
										</a>
									</div>
									<div id="navbar" class="navbar-menu">
										<div class="navbar-start">
											<a class="navbar-item" href="/companies">Companies</a>
											<a class="navbar-item" href="/documentation">API Documentation</a>
											<div class="navbar-item has-dropdown is-hoverable">
												<a class="navbar-link">iOS Apps</a>
												<div class="navbar-dropdown">
													<a class="navbar-item" href="itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist">Astra Exchange</a>
													<a class="navbar-item" onclick="alert('Coming soon!')">Notes Exchange</a>
												</div>
											</div>
										</div>
										<div class="navbar-end">
											<div class="navbar-item">
												<a class="button is-primary auth sign-up is-hidden">Sign up</a>
												<a class="button is-info auth sign-in is-hidden">Sign in</a>
												<div class="navbar-item has-dropdown is-hoverable auth user-dropdown is-hidden">
													<a class="navbar-link auth user-link"></a>
													<div class="navbar-dropdown">
														<a class="navbar-item action settings">Settings</a>
														<hr class="navbar-divider">
														<a class="navbar-item auth sign-out">Sign out</a>
													</div>
												</div>
											</div>
										</div>
									</div>
								</nav>
								<div class="modal settings">
									<div class="modal-background close-settings"></div>
									<div class="modal-card">
										<header class="modal-card-head">
											<p class="modal-card-title">Settings</p>
											<button class="delete close-settings" aria-label="close"></button>
										</header>
										<section class="modal-card-body">
											<div class="field">
												<label class="label">Name</label>
												<p class="settings name"></p>
											</div>
											<div class="field">
												<label class="label">Email</label>
												<p class="settings email"></p>
											</div>
											<div class="field">
												<label class="label">Balance</label>
												<p class="settings balance"></p>
											</div>
											<div class="field">
												<label class="label">Independence</label>
												<p class="settings independence"></p>
											</div>
											<div class="field">
												<label class="label">Pin</label>
												<p class="settings pin">...</p>
											</div>
										</section>
										<footer class="modal-card-foot">
											<a class="button is-primary password-reset"><strong>Send a password reset email</strong></a>
										</footer>
									</div> 
								</div>
								<img src="${image}" alt="Company image">
								<br>
								<h1>${val.name}</h1>
								<br>
								<h2>${userVal.name}</h2>
								<br>
								<p>${val.description}</p>
								<script src="/js/company.js"></script>
								<script src="/js/base.js"></script>
								<script>
									company({ id: '${companySnapshot!.key}', image: '${image}', name: '${val.name}', owner: { id: '${userSnapshot!.key}', name: '${userVal.name}', email: '${userVal.email}', balance: ${userVal.balance} }, description: '${val.description}', products: [] })
								</script>
							</body>
						</html>
					`)
				})
			} else return res.status(404).redirect('/companies')
		})
	)
)