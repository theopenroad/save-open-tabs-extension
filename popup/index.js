const saveBtn = document.getElementById('save')
const clearBtn = document.getElementById('clear')
const msg = document.getElementById('msg')
const list = document.getElementById('list')

const print = (str, persist) => {
	msg.innerText = str
	msg.style.display = 'block'
	if(!persist) {
		setTimeout(() => {
			msg.style.display = 'none'
		}, 900)
	}
}

const displayList = () => {
	list.innerHTML = ''
	browser.storage.local.get('savedTabs')
		.then(({ savedTabs }) => {
			savedTabs.forEach(({ title, url }) => {
				const link = document.createElement('li')
				link.innerHTML = `<a href="${url}">${title}</a>`
				list.append(link)
			})
		})
		.catch(err => {
			console.log({ err })
			print('No tabs saved', true)
		})
}

saveBtn.onclick = () => {
	browser.tabs.query({})
		.then(tabs => {
			let savedTabs = tabs
				.filter(({ url }) => url.slice(0, 5) !== 'about')
				.map(({ title, url }) => ({ title, url }))
			
			return browser.storage.local.set({ savedTabs })
		})
		.then(() => {
			print('Saved!')
			displayList()
		})
		.catch(err => {
			console.log({ err })
			print('Error!!!')
		})
}

clearBtn.onclick = () => {
	list.innerHTML = ''
	browser.storage.local.remove('savedTabs')
		.then(() => {
			print('Cleared!')
		})
}

displayList()