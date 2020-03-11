const saveBtn = document.getElementById('save')
const clearBtn = document.getElementById('clear')
const openBtn= document.getElementById('open')
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
	browser.tabs.query({currentWindow:true})
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

openBtn.onclick= ()=>{
	
	list.innerHTML = ''
	browser.storage.local.get('savedTabs')
		.then(({ savedTabs }) => {
			savedTabs.forEach(({ title, url }) => {
				pageUrl=url
				browser.tabs.create({
					url:pageUrl
				});
		})})
}


displayList()
