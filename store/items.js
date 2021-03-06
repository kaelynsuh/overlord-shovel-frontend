import Vue from 'vue'
import _ from 'lodash'
import { getField, updateField } from 'vuex-map-fields'

export const state = function(){
  return ({
    campaignId: null,
    collection: {},
    currentUser: {},
  })
}

export const getters = {
  getField,
  collection: state => { return _.pickBy(state.collection, function(value){return value.campaign_id == state.campaignId})}
}

export const mutations = {
  updateField,
  update(state, {item}){
    Vue.set(state.collection, item.id, item)
  },
  remove(state, id){
    Vue.delete(state.collection, id)
  }
}

export const actions = {
  async init({commit}, params){
    let campaignId = Number(params.campaign_id)
    commit('updateField', {path: 'campaignId', value: campaignId })    
    await this.$axios.get(`/campaigns/${campaignId}/items`).then(response => {
      let items = Object.assign({}, ...response.data.data.map(i => {return {[i.id]: i.attributes} }) )
      commit('updateField', {path: 'collection', value: items })
    })
  },
  new({commit, state}){
    let item = {id: 0, name: null, description: null, value: 0, campaign_id: state.campaignId, character_id: null}
    commit('update', {item})
  },
  submit({commit, state}, {item}){
    let saveItem = (response)=>{
      let item = response.data.data.attributes
      commit('update', {item})
    }
    if (item.id == 0){
      this.$axios.post('/items', item).then(response => {
        saveItem(response)
      })
    } else { 
      this.$axios.patch('/items/' + item.id, item).then(response => {
        saveItem(response)
      })
    }
  },
  delete({commit}, {item}) {
    this.$axios.delete('/items/' + item.id).then(response => {
      commit('remove', item.id)
    })
  },
}