import Vue from 'vue'
import _ from 'lodash'
import { getField, updateField } from 'vuex-map-fields'

export const state = function(){
  return ({
    collection: {},
    campaignId: null
  })
}

export const getters = {
  getField,
  collection: state => { return state.collection },
  byCampaign: state => { return _.groupBy(state.collection, 'campaign_id') },
  byPlayer: state => { return _.groupBy(state.collection, 'player_id') },
}

export const mutations = {
  updateField,
  update(state, {character}){
    Vue.set(state.collection, character.id, character)
  },
  remove(state, id){
    Vue.delete(state.collection, id)
  }
}

export const actions = {
  async init({commit}, params){
    if (params.campaign_id){
      let campaignId = Number(params.campaign_id)
      commit('updateField', {path: 'campaignId', value: campaignId }) 
    }
    await this.$axios.get('/characters').then(response => {
      let characters = Object.assign({}, ...response.data.data.map(c => {return {[c.id]: c.attributes} }) )
      commit('updateField', {path: 'collection', value: characters })
    })
  },
  new({commit}, userId){
    let character = {id: 0, name: null, campaign_id: null, player_id: userId}
    commit('update', {character})
  },
  submit({commit, dispatch, state}, {character}){
    let saveCharacter = (response)=>{
      let character = response.data.data.attributes
      commit('update', {character})
    }
    if (character.id == 0){
      this.$axios.post('/characters', character).then(response => {
        saveCharacter(response)
      })
    } else {
      this.$axios.patch('/characters/' + character.id, character).then( response => {
        saveCharacter(response)
      })
    }
  },
  delete({commit}, {character}) {
    this.$axios.delete('/characters/' + character.id).then(response => {
      commit('remove', character.id)
    })
  },
}