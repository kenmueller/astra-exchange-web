import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import { configure } from 'nunjucks'
import { join } from 'path'

const app = express()
const _app = functions.https.onRequest(app)
export { _app as app }

configure(join(__dirname, '../views'), {
	autoescape: true,
	express: app
})

const db = admin.database()

app.get('/users/:slug', (req, res) =>
	db.ref(`slugs/users/${req.params.slug}`).on('value', snapshot =>
		db.ref(`users/${snapshot!.val()}`).on('value', userSnapshot => {
			if (userSnapshot && userSnapshot.exists()) {
				const val = userSnapshot.val()
				res.status(200).render('user.html', {
					user: {
						id: userSnapshot.key,
						name: val.name,
						email: val.email,
						balance: val.balance
					}
				})
			} else
				res.status(404).redirect('/users')
		})
	)
)

app.get('/companies/:slug', (req, res) =>
	db.ref(`slugs/companies/${req.params.slug}`).on('value', snapshot =>
		db.ref(`companies/${snapshot!.val()}`).on('value', companySnapshot => {
			if (companySnapshot && companySnapshot.exists()) {
				const val = companySnapshot.val()
				const image = val.image ? val.image : '/images/astra.png'
				return db.ref(`users/${val.owner}`).on('value', userSnapshot => {
					const userVal = userSnapshot!.val()
					res.status(200).render('company.html', {
						company: {
							id: companySnapshot.key,
							name: val.name,
							image,
							description: val.description
						},
						user: {
							id: userSnapshot!.key,
							name: userVal.name,
							email: userVal.email,
							balance: userVal.balance
						}
					})
				})
			} else {
				res.status(404).redirect('/companies')
				return Promise.resolve()
			}
		})
	)
)