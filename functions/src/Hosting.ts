import * as functions from 'firebase-functions'
// import * as admin from 'firebase-admin'

// const firestore = admin.firestore()

export const hosting = functions.https.onRequest((req, res) => {
	return Promise.resolve()
})