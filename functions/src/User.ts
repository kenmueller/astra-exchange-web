import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Slug from './Slug'

const db = admin.database()

export default class User {
	static normalizeEmail(email: string): string {
		return email.replace('.', '%2e')
	}
}

export const userCreated = functions.database.ref('users/{uid}').onCreate((snapshot, context) => {
	const uid: string = context.params.uid
	const val = snapshot.val()
	return Promise.all([
		db.ref(`users/${uid}/independence`).set(0),
		db.ref(`emails/${User.normalizeEmail(val.email)}`).set(uid),
		db.ref(`slugs/users/${Slug.slugify(val.name)}`).set(uid),
		db.ref('cards').push(uid)
	])
})

export const userDeleted = functions.auth.user().onDelete(user =>
	db.ref(`users/${user.uid}`).once('value').then(userSnapshot =>
		db.ref(`users/${user.uid}/cards`).once('child_added').then(cardSnapshot => {
			const userVal = userSnapshot.val()
			return Promise.all([
				db.ref(`cards/${cardSnapshot.key}`).remove(),
				db.ref(`emails/${User.normalizeEmail(userVal.email)}`).remove(),
				db.ref(`slugs/users/${Slug.slugify(userVal.name)}`).remove(),
				db.ref(`users/${user.uid}`).remove()
			])
		})
	)
)