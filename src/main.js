import { createApp } from 'vue';
import './style.css';
import router from './router';
import PrimeVue from 'primevue/config';
import Noir from './presets/Noir';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import Image from 'primevue/image';
import Toast from 'primevue/toast';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';

import ToastService from 'primevue/toastservice';

import App from './App.vue';

const app = createApp(App);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Noir,
        options: {
            prefix: 'p',
            darkModeSelector: '.p-dark',
            cssLayer: false,
        }
    }
});
app.use(ToastService);
app.component('Button', Button);
app.component('Chart', Chart);
app.component('Image', Image);
app.component('Toast', Toast);
app.component('Password', Password);
app.component('InputText', InputText);
app.component('Checkbox', Checkbox);
app.component('DatePicker', DatePicker);
app.component('AutoComplete', AutoComplete);
app.component('Select', Select);
app.mount('#app');

