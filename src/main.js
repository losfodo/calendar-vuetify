import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import firebase from "firebase";//import dados backend firebase
//import 'firebase/firestore';//firestore em tempo real usado como backend
import VueTextareaAutosize from 'vue-textarea-autosize' //import da dependencia detalhes dimensionando automaticamente com texto

Vue.use(VueTextareaAutosize)//para usar a dependencia importada

Vue.config.productionTip = false

firebase.initializeApp({//coloca abaixo o firebaseConfig com os dados pego site firebase em web q foi criado
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
});

export const db = firebase.firestore();//exportando no main.js do projeto o firebase fica global para qualquer arquivo criado no projeto vue

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
