<template>
  <v-row class="fill-height"><!--fill-height: preenchera toda a altura em linha row-->
    <v-col><!--tudo dentro desta col coluna da template-->
      <v-sheet height="64"><!--v-sheet folha com conteudo calendario-->
        <v-toolbar flat color="white">
          <v-btn color="primary" dark @click.stop="dialog = true">
            New Event
          </v-btn>
          <v-btn outlined class="mr-4" @click="setToday"><!--seta para o dia atual botão-->
            Today
          </v-btn>
          <v-btn fab text small @click="prev"><!--voltar calendario e a frente next o mes-->
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title><!--titulo ex:outubro 2021 muda de acordo dia semana mês-->
          <div class="flex-grow-1"></div>
          <v-menu bottom right><!--botão a direita com dia semana mes ..-->
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-container><!--todos os v-model pego do firebase, v-dialog modal de criação de eventos no calendar-->
            <v-form @submit.prevent="addEvent">
              <v-text-field v-model="name" type="text" label="event name (required)"></v-text-field>
              <v-text-field v-model="details" type="text" label="detail"></v-text-field>
              <v-text-field v-model="start" type="date" label="start (required)"></v-text-field>
              <v-text-field v-model="end" type="date" label="end (required)"></v-text-field>
              <v-text-field v-model="color" type="color" label="color (click to open color menu)"></v-text-field>
              <v-btn type="submit" color="primary" class="mr-4" @click.stop="dialog = false"><!--@click.stop="dialog = false" click ao salvar fecha a modal-->
                create event
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogDate" max-width="500">
        <v-card>
          <v-container>
            <v-form @submit.prevent="addEvent">
              <v-text-field v-model="name" type="text" label="event name (required)"></v-text-field>
              <v-text-field v-model="details" type="text" label="detail"></v-text-field>
              <v-text-field v-model="start" type="date" label="start (required)"></v-text-field>
              <v-text-field v-model="end" type="date" label="end (required)"></v-text-field>
              <v-text-field v-model="color" type="color" label="color (click to open color menu)"></v-text-field>
              <v-btn type="submit" color="primary" class="mr-4" @click.stop="dialog = false">
                create event
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

<v-sheet height="600"><!--updateRange: após mudanças-->
<!---->
  <v-calendar
  ref="calendar"
  v-model="focus"
  color="primary"
  :events="events"
  :event-color="getEventColor"
  :event-margin-bottom="3"
  :now="today"
  :type="type"
  @click:event="showEvent"
  @click:more="viewDay"
  @click:date="setDialogDate"
  @change="updateRange"
  ></v-calendar><!--calendario em si, v-model="focus"=dia atual,event-color=cores de acordo com evento, -->
  <!--remover  full-width-->
  <v-menu
  v-model="selectedOpen"
  :close-on-content-click="false"
  :activator="selectedElement"
  offset-x
  ><!--selectedOpen:evento selecionado onde coloca nome e detalhes edit delete clicado no proprio calendario-->
  <v-card color="grey lighten-4" :width="350" flat>
    <v-toolbar :color="selectedEvent.color" dark>
      <v-btn @click="deleteEvent(selectedEvent.id)" icon><!--botão para deletar o evento-->
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
      <div class="flex-grow-1"></div>
    </v-toolbar>

    <v-card-text>
      <form v-if="currentlyEditing !== selectedEvent.id"><!--currentlyEditing se clico no botão de edição e diferente currentlyEditing -->
        {{ selectedEvent.details }}
      </form><!--mostra os detalhes apenas os dados de um evento selecionado-->
      <form v-else>
        <textarea-autosize
        v-model="selectedEvent.details"
        type="text"
        style="width: 100%"
        :min-height="100"
        placeholder="add note">
      </textarea-autosize><!--colocar texto nota do selectedEvent.details-->
    </form>
  </v-card-text>

  <v-card-actions>
    <v-btn text color="secondary" @click="selectedOpen = false">
      close
    </v-btn><!--botão para fechar o textarea-autosize-->
    <v-btn v-if="currentlyEditing !== selectedEvent.id" text @click.prevent="editEvent(selectedEvent)">
      edit
    </v-btn><!--botão de edição, remove prevent padrão e editEvent(selectedEvent) para editar-->
    <v-btn text v-else type="submit" @click.prevent="updateEvent(selectedEvent)">
      Save
    </v-btn><!--se não  salva o evento-->
  </v-card-actions>
</v-card>
</v-menu>
</v-sheet>
</v-col>
</v-row>
</template>

<script>
import { db } from '@/main' //para importar o firebase q esta no main direto da aplicação nessa caso
export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),//data atual de agora, formato toISOString, subs 10 caracteres
    focus: new Date().toISOString().substr(0, 10),
    type: 'month', //data do mes inicialmente
    typeToLabel: {//tipos de label opçoes a mostrar no calendario
      month: 'Month',
      week: 'Week',
      day: 'Day',
      '4day': '4 Days',
    },
    name: null,//criação de um evento nome detalhes e data start e end e cor padrão
    details: null,
    start: null,
    end: null,
    color: '#1976D2', // default event color
    currentlyEditing: null,//clique de edição
    selectedEvent: {},//evento selecionado ou o id especifico
    selectedElement: null,//selecionar o evento
    selectedOpen: false, //se a modal com dados do evento estão abertos ou não
    events: [],//eventos por aqui array vazio inicial, onde fica os dados firebase
    dialog: false,//para criar um evento inicia falso
    dialogDate: false
  }),
  mounted () {
    this.getEvents()//manter montados os eventos pego no firebase o backend
  },
  computed: {
    title () {
      const { start, end } = this
      if (!start || !end) {
        return ''
      }
      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth
      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear
      const startDay = start.day + this.nth(start.day)//começo do dia
      const endDay = end.day + this.nth(end.day)//fim do dia a ver do array nth
      switch (this.type) {//mudança de tipo aqui se for mes semana 4dias..
        case 'month':
        return `${startMonth} ${startYear}`
        case 'week':
        case '4day':
        return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
        case 'day':
        return `${startMonth} ${startDay} ${startYear}`
      }
      return ''
    },
    monthFormatter () {//formatação do mes
      return this.$refs.calendar.getFormatter({
        timeZone: 'UTC', month: 'long',
      })
    }
  },
  methods: {
    async getEvents () {//função assincrona..
      let snapshot = await db.collection('calEvent').get()//metodo get para pegar os dados do firebase, id feito no firebase calEvent
      const events = []//const inicia vazio
      snapshot.forEach(doc => {//faz um forEach
      //console.log(doc, "mostra o id do snapshot calEvent ou url data")
      //console.log(doc.data(), "mostra os parametros que serão colocados no calendario, mas id não esta ali")
        let appData = doc.data()//armazena no appData os dados com parametros
        appData.id = doc.id //coloca id do doc para receber tbm appData
        events.push(appData)//coloca na const o appData que possui todos os parametros
      })
      this.events = events //this.events property inicial array vazio recebe events const com os dados de appData
    },//assim vai aparecer os eventos
    setDialogDate( { date }) {
      this.dialogDate = true
      this.focus = date
    },
    viewDay ({ date }) {//clicando no dia da data no calendario define o foco da data clicada
      this.focus = date
      this.type = 'day'//tipo de dia mostra oq tem no dia
    },
    getEventColor (event) {
      return event.color //retornar event.color parametro que esta dentro de event
    },
    setToday () {//volta para o dia atual
      this.focus = this.today
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {//proximo mes e prev mes anterior
      this.$refs.calendar.next()
    },
    async addEvent () {//adicionar um evento
      if (this.name && this.start && this.end) {//se nome e data inicial e final
        await db.collection("calEvent").add({//define assim os valores
          name: this.name,//nome
          details: this.details,//detalhes
          start: this.start,//data inicial
          end: this.end,//data final
          color: this.color//cor
        })
        this.getEvents()//atualiza o calendario logo apos salvar eventos
        this.name = '',//e assim limpa os campos
        this.details = '',
        this.start = '',
        this.end = '',
        this.color = ''
      } else {
        alert('You must enter event name, start, and end time')//alerta de aviso caso algo não for preenchido
      }
    },
    editEvent (ev) {
      this.currentlyEditing = ev.id
    },
    async updateEvent (ev) {//metodo salvar evento
      await db.collection('calEvent').doc(this.currentlyEditing).update({//collection para pegar calEvent que sera id do firebase e fazer update
        details: ev.details //details pego do campo string-value uma property
      })
      this.selectedOpen = false,
      this.currentlyEditing = null //click da edição
    },
    async deleteEvent (ev) {//ação de deletar lixeira de um id editado
      await db.collection("calEvent").doc(ev).delete()//para assim deletar o evento com o metodo .delete
      this.selectedOpen = false,
      this.getEvents()
    },
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event //adiciona o vento selecionado
        this.selectedElement = nativeEvent.target //mostrar evento target nativeEvent
        setTimeout(() => this.selectedOpen = true, 10)
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)//em 10 sentessimos abre const open
      } else {
        open()//em 10 sentessimos abre const open, assim selecionando em algum evento abre modal 
      }
      nativeEvent.stopPropagation()
    },
    updateRange ({ start, end }) {
      this.start = start
      this.end = end
    },
    nth (d) {
      return d > 3 && d < 21 //dia q for maior q 3 e menor q 21
      ? 'th'
      : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
    }
  }
}
</script>
