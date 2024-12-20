import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')


document.addEventListener('keydown', (event) => {
	// Check if Ctrl + P or Cmd + P is pressed
	if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
		event.preventDefault(); // Prevent the default print dialog
		// console.log('Print shortcut intercepted and disabled.');
	}
});
