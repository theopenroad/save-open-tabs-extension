const themeSwitch = document.getElementById('theme-switch-input')

const saveBtn = document.getElementById('save')
const clearBtn = document.getElementById('clear')
const openBtn= document.getElementById('open')

const msg = document.getElementById('msg')
const list = document.getElementById('list')

const print = (str, persist) => {
	msg.innerText = str
	msg.style.display = 'block'
	if (!persist) {
		setTimeout(() => {
			msg.style.display = 'none'
		}, 1000)
	}
}

const displayList = () => {
	browser.storage.local.get('savedTabs')
		.then(({ savedTabs }) => {
			list.innerHTML = ''

			savedTabs.forEach(({ title, url }) => {
				const item = document.createElement('li')
				const a = document.createElement('a')
				a.href = url
				a.title = url
				
				const linkText = document.createTextNode(title)
				a.appendChild(linkText)

				item.appendChild(a)
				list.append(item)
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
			list.innerHTML = ''
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

browser.storage.local.get('darkMode')
	.then(({ darkMode }) => {
		if (darkMode) {
			themeSwitch.checked = true
			document.body.classList.add('dark')
		}
	})
	.finally(() => displayList())
