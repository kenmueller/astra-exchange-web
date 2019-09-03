import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Slug from './Slug'
import Reputation, { ReputationAction } from './Reputation'

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
		db.ref('cards').push(uid),
		firestore.doc(`users/${uid}`).set({
			name: val.name,
			email: val.email,
			balance: val.balance,
			reputation: 0
		}).then(() =>
			Reputation.push(uid, ReputationAction.join, 'You joined Astra Exchange')
		)
	])
})

export const userUpdated = functions.database.ref('users/{uid}').onUpdate((change, context) => {
	const val = change.after.val()
	return firestore.doc(`users/${context.params.uid}`).update({
		name: val.name,
		email: val.email,
		balance: val.balance,
		reputation: val.reputation
	})
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