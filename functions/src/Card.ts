import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.database()

export const cardCreated = functions.database.ref('cards/{cardId}').onCreate((snapshot, context) =>
	db.ref(`users/${snapshot.val()}/cards/${context.params.cardId}`).set({ name: 'Debit Card', pin: generatePin() })
)

function generatePin(): string {
	return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
}