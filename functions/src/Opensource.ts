import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
	<head>
		<script src="https://astra.exchange/api"></script>
		<title><!-- TITLE --></title>
		<style>
			/* CSS */
		</style>
	</head>
	<body>
		<!-- BODY -->
		<script>
			/* JAVASCRIPT */
		</script>
	</body>
</html>`

const firestore = admin.firestore()

export const opensource = functions.https.onRequest((req, res) => {
	const urlParts = req.url.split('/').slice(1)
	const urlIsIndex = req.url === '/'
	return urlParts[0] === 'edit'
		? urlParts.length === 1
			? editIndex(res)
			: editPage(urlParts.slice(1), res)
		: firestore.doc(`opensource/${urlIsIndex ? '\\' : urlParts.join('\\')}`).get().then(page => {
			if (page.exists) {
				const html: string | undefined = page.get('html')
				res.status(html ? 200 : 500).send(html || '<!DOCTYPE html><html><head><title>An error occurred</title></head><body><h1>An error occurred</h1><p>Please reload the page</p><button onclick="location.reload()">Reload</button></body></html>')
			} else {
				const url = urlIsIndex ? 'index' : urlParts.join('/')
				res.status(200).send(createPage({
					url,
					title: `Create ${url}`,
					html: DEFAULT_HTML,
					submitButtonTitle: 'Create',
					script: `
						editor.session.on('change', () =>
							submit.disabled = !editor.getValue().trim().length
						)
						submit.addEventListener('click', () => {
							submit.classList.add('is-loading')
							const html = editor.getValue()
							return (html.trim().length
								? firestore.doc('opensource/${urlIsIndex ? '\\\\' : urlParts.join('\\\\')}').set({ html })
								: Promise.resolve()
							).then(() => location.reload())
						})
					`
				}))
			}
		})
})

function editPage(urlParts: string[], res: functions.Response): Promise<void | functions.Response> {
	return firestore.doc(`opensource/${urlParts.join('\\')}`).get().then(page => {
		const url = urlParts.join('/')
		if (page.exists) {
			const firestoreDoc = `firestore.doc('opensource/${urlParts.join('\\\\')}').`
			res.status(200).send(createPage({
				url,
				title: `Edit ${url}`,
				html: page.get('html') || DEFAULT_HTML,
				submitButtonTitle: 'Submit',
				script: `
					editor.session.on('change', () =>
						submit.innerHTML = editor.getValue().trim().length ? 'Submit' : 'Delete'
					)
					submit.addEventListener('click', () => {
						submit.classList.add('is-loading')
						const html = editor.getValue()
						return html.trim().length
							? ${firestoreDoc}update({ html }).then(() => submit.classList.remove('is-loading'))
							: confirm('Are you sure you want to delete ${url}?\\nThis action cannot be undone')
								? ${firestoreDoc}delete().then(() => location.reload())
								: submit.classList.remove('is-loading')
					})
				`
			}))
		} else
			res.status(404).redirect(`/${url}`)
	})
}

function editIndex(res: functions.Response): Promise<void | functions.Response> {
	return firestore.doc('opensource/\\').get().then(page => page.exists
		? res.status(200).send(createPage({
			url: 'index',
			title: 'Edit index',
			html: page.get('html') || DEFAULT_HTML,
			submitButtonTitle: 'Submit',
			script: `
				editor.session.on('change', () =>
					submit.innerHTML = editor.getValue().trim().length ? 'Submit' : 'Delete'
				)
				submit.addEventListener('click', () => {
					submit.classList.add('is-loading')
					const html = editor.getValue()
					return html.trim().length
						? firestore.doc('opensource/\\\\').update({ html }).then(() => submit.classList.remove('is-loading'))
						: confirm('Are you sure you want to delete index?\\nThis action cannot be undone')
							? firestore.doc('opensource/\\\\').delete().then(() => location.reload())
							: submit.classList.remove('is-loading')
				})
			`
		}))
		: res.status(404).redirect('/')
	)
}

function createPage({ url, title, html, submitButtonTitle, script }: { url: string, title: string, html: string, submitButtonTitle: string, script: string }): string {
	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="copyright" content="2019 Ken Mueller">
		<meta name="description" content="Astra Exchange Open Source - ${url}">
		<meta name="keywords" content="astra exchange,astra.exchange,astra,exchange,ad astra,ad,astra,astra exchange open source,open source,${url},ken mueller,ken,mueller">
		<script defer src="/__/firebase/5.8.4/firebase-app.js"></script>
		<script defer src="/__/firebase/5.8.4/firebase-firestore.js"></script>
		<script defer src="/__/firebase/init.js"></script>
		<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
		<script defer src="/ace/src-min/ace.js"></script>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
		<link rel="stylesheet" href="/css/index.css">
		<link rel="icon" href="https://astra.exchange/images/astra.png">
		<title>${title}</title>
	</head>
	<body>
		<button class="button is-info is-outlined submit">${submitButtonTitle}</button>
		<div id="editor"><xmp>${html}</xmp></div>
		<script>
			document.addEventListener('DOMContentLoaded', () => {
				const firestore = firebase.firestore()
				const editor = ace.edit('editor')
				const submit = document.querySelector('.button.submit')
				editor.setTheme('ace/theme/monokai')
				editor.session.setMode('ace/mode/html')
				editor.setShowPrintMargin(false)
				editor.getSession().setUseWrapMode(true)
				editor.session.setOptions({ tabSize: 4, useSoftTabs: false })
				${script}
			})
		</script>
	</body>
</html>`
}