const themeSwitch = document.getElementById('theme-switch-input')

const saveBtn = document.getElementById('save')
const clearBtn = document.getElementById('clear')
const openBtn= document.getElementById('open')

const msg = document.getElementById('msg')
const gridList = document.getElementById('grid-list')

const print = (str, persist) => {
	msg.innerText = str
	msg.style.display = 'block'

	if (!persist) {
		setTimeout(() => {
			msg.style.display = 'none'
		}, 900)
	}
}

const deleteItem = (url) => {
	const selected = document.getElementById(url)
	selected.previousElementSibling.remove()
	selected.remove()

	browser.storage.local.get('savedTabs')
		.then(({ savedTabs }) => {
			browser.storage.local.set({
				savedTabs: savedTabs.filter((tab) => tab.url !== url)
			})
			.then(() => {
				setTimeout(() => {
					document.querySelectorAll('#grid-list .index')
						.forEach((element, i) => {
							element.innerHTML = `${i + 1}.`
						})
				}, 150)
			})
		})
}

const displayList = () => {
	browser.storage.local.get('savedTabs')
		.then(({ savedTabs }) => {
			gridList.innerHTML = ''
			const arr = []
			
			savedTabs.forEach(({ title, url }, i) => {
				const a = document.createElement('a')
				a.id = url
				a.href = url
				a.title = url
				
				const index = document.createElement('span')
				index.innerHTML = `${i + 1}.`
				index.className = 'index'

				a.append(index)
				a.append(document.createTextNode(title))

				const deleteButton = document.createElement('button')
				deleteButton.onclick = () => deleteItem(url)
				deleteButton.innerText = '✖'

				arr.push(deleteButton, a)
			})

			gridList.append(...arr)
		})
		.catch(err => {
			console.log({ err })
			print('No tabs saved', true)
		})
}

saveBtn.onclick = () => {
	browser.tabs.query({})
		.then(tabs => {
			const savedTabs = tabs
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
			print('Error!')
		})
}

clearBtn.onclick = () => {
	browser.storage.local.remove('savedTabs')
		.then(() => {
			gridList.innerHTML = ''
			print('Cleared!')
		})
}

openBtn.onclick = () => {
	async function openNewTab (tmp) {
		return await browser.tabs.create({
			url: tmp
		})
	}

	browser.storage.local.get('savedTabs')
		.then(({ savedTabs }) => {
			savedTabs.forEach(({ title, url }) => {
				openNewTab(url)
			})
		})
}

themeSwitch.onchange = (e) => {
	const isDarkMode = e.target.checked
	browser.storage.local.set({ darkMode: isDarkMode })
		.then(() => {
			if (isDarkMode) {
				document.body.classList.add('dark')
			} else {
				document.body.classList.remove('dark')
			}
		})
}

// Renders the list
browser.storage.local.get('darkMode')
	.then(({ darkMode }) => {
		if (darkMode) {
			themeSwitch.checked = true
			document.body.classList.add('dark')
		}
	})
	.finally(() => displayList())
