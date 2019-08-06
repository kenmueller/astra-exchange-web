import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Slug from './Slug'

const db = admin.database()
const firestore = admin.firestore()

export default class User {
	static normalizeEmail(email: string): string {
		return email.replace('.', '%2e')
	}
}

export const userCreated = functions.database.ref('users/{uid}').onCreate((snapshot, context) => {
	const uid: string = context.params.uid
	const val = snapshot.val()
	return Promise.all([
		db.ref(`emails/${User.normalizeEmail(val.email)}`).set(uid),
		db.ref(`slugs/users/${Slug.slugify(val.name)}`).set(uid),
		db.ref('cards').push(uid)
	])
})

export const userUpdated = functions.database.ref('users/{uid}').onUpdate((change, context) => {
	const val = change.after.val()
	const data = { name: val.name, email: val.email, balance: val.balance, reputation: val.reputation }
	const doc = firestore.doc(`users/${context.params.uid}`)
	return doc.get().then(user => user.exists ? doc.update(data) : doc.set(data))
})

export const userDeleted = functions.auth.user().onDelete(user =>
	db.ref(`users/${user.uid}`).once('value').then(userSnapshot =>
		db.ref(`users/${user.uid}/cards`).once('child_added').then(cardSnapshot => {
			const userVal = userSnapshot.val()
			return Promise.all([
				db.ref(`cards/${cardSnapshot.key}`).remove(),
				db.ref(`emails/${User.normalizeEmail(userVal.email)}`).remove(),
				db.ref(`slugs/users/${Slug.slugify(userVal.name)}`).remove(),
				db.ref(`users/${user.uid}`).remove(),
				firestore.doc(`users/${user.uid}`).delete()
			])
		})
	)
)