import * as admin from 'firebase-admin'

const firestore = admin.firestore()

export default class Reputation {
	static getAmountForAction(action: ReputationAction): Promise<number> {
		return firestore.doc(`reputation/${action.valueOf()}`).get().then(doc => {
			const amount: number | undefined = doc.get('amount')
			return amount === undefined ? Promise.reject() : amount
		})
	}

	static push(uid: string, action: ReputationAction, description: string, extras?: { uid: string } | { deckId: string }, reputation?: number): Promise<FirebaseFirestore.WriteResult> {
		return Reputation.getAmountForAction(action).then(amount =>
			Reputation.pushWithAmount(uid, amount, description, extras, reputation)
		)
	}

	static pushWithAmount(uid: string, amount: number, description: string, extras?: { uid: string } | { deckId: string }, reputation?: number): Promise<FirebaseFirestore.WriteResult> {
		const date = new Date
		const addDocument = (currentReputation: number) =>
			firestore.collection(`users/${uid}/reputationHistory`).add(Object.assign({
				date,
				amount,
				description,
				after: currentReputation + amount
			}, extras)).then(_documentReference =>
				firestore.doc(`users/${uid}`).update({ reputation: admin.firestore.FieldValue.increment(amount) })
			)
		return reputation === undefined
			? firestore.doc(`users/${uid}`).get().then(user =>
				addDocument(user.get('reputation') || 0)
			)
			: addDocument(reputation)
	}
}

export enum ReputationAction {
	join = 'join',
	outgoingTransaction = 'outgoing-transaction',
	incomingTransaction = 'incoming-transaction',
	boughtTable = 'bought-table'
}