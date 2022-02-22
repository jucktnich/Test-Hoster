import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js'
import * as db from "./firebase.js"

//Components
Vue.component ("progress-bar", {
    props: ["backgroundcolor", "foregroundcolor1", "foregroundcolor2", "value1", "value2"],
    data: function() {
        return {
            backgroundStyle: "width: 100%; height: 0.75em; border-radius: 0.375em; background-color: " + this.backgroundcolor + ";"
        }
    },
    computed: {
        foregroundStyle1: function() {
            return "background-color: " + this.foregroundcolor1 + "; width: " + this.value1 * 100 + "%; height: 0.75em; border-radius: 0.375em;"
        },
        foregroundStyle2: function() {
            return "background-color: " + this.foregroundcolor2 + "; width: " + ((this.value2 / this.value1) * 100) + "%; height: 0.75em; border-radius: 0.375em;"
        }
    },
    template: '<div :style="backgroundStyle"><div :style="foregroundStyle1"><div :style="foregroundStyle2"></div></div></div>'
});
Vue.component ("fuellstand-anzeige-provider", {
    props: ["name", "items", "itemsmax"],
    data: function() {
        return {innitnewitemsvalue: this.items, backgroundcolor: "lightgrey", showPlane: 0}
    },
    computed: {
        newitemsvalue: {
            get() {
                return this.innitnewitemsvalue
            },
            set(val) {
                this.innitnewitemsvalue = parseInt(val)
                return this.innitnewitemsvalue
            }
        },
        percent: function () {
            return (this.items/this.itemsmax)
        },
        deltaItems: {
            get() {
                return (this.newitemsvalue - this.items)
            },
            set(val) {
                val = parseInt(val)
                this.newitemsvalue = val + this.items
                return val
            }
        },
        deltaPercent: function() {
            return ((this.deltaItems + this.items)/this.itemsmax)
        },
        foregroundcolor1: function () {
            if (this.deltaItems < 0) {
                return "hsl(" + ((this.items/this.itemsmax)*120) + ", 100%, 66%)"
            } else {
                return "hsl(" + (((this.deltaItems + this.items)/this.itemsmax)*120) + ", 100%, 33%)"
            }
        },
        foregroundcolor2: function () {
            if (this.deltaItems < 0) {
                return "hsl(" + (((this.deltaItems + this.items)/this.itemsmax)*120) + ", 100%, 33%)"
            } else {
                return "hsl(" + ((this.items/this.itemsmax)*120) + ", 100%, 66%)"
            }
        },
        value1: function() {
            if (this.percent > this.deltaPercent) {
                return this.percent
            } else {
                return this.deltaPercent
            }
        },
        value2: function() {
            if (this.percent < this.deltaPercent) {
                return this.percent
            } else {
                return this.deltaPercent
            }
        }
    },
    watch: {
        items: function(val) {
            console.log("Emit")
            this.$emit('input', val);
        }
    },
    template: '<div> <div style="display: flex; justify-content: space-between;"> <h2>{{ name }}</h2> <div style="display: flex; justify-content: flex-end; align-items: center;"> <h2>{{ items }}</h2> <h2 v-if="deltaItems > 0">+{{ deltaItems }}</h2> <h2 v-if="deltaItems < 0">{{ deltaItems }}</h2> <h2>/{{ itemsmax }}</h2> </div> </div> <progress-bar v-bind:backgroundcolor="backgroundcolor" v-bind:value1="value1" v-bind:value2="value2" v-bind:foregroundcolor1="foregroundcolor1" v-bind:foregroundcolor2="foregroundcolor2"></progress-bar> <br> <div> <div v-if="showPlane == 0" style="display: flex; justify-content: space-around;"> <button v-on:click="showPlane = 1" style="border: none; padding: 0.375em; border-radius: 0.5em;">Produkte hinzufügen</button> <button v-on:click="showPlane = 2" style="border: none; padding: 0.375em; border-radius: 0.5em;">Wert korrigieren</button> </div> <div v-if="showPlane == 1" style="display: flex; justify-content: space-around;"> <div> <input type="number" style="width: 3em; border-style: solid;" v-model="deltaItems"> <button v-on:click="items = parseInt(items + parseInt(deltaItems)); deltaItems = 0; newitemsvalue = items; showPlane = 0" style="border: none; padding: 0.375em; border-radius: 0.5em;">Produkte hinzufügen</button> </div> <button v-on:click="showPlane = 0" style="border: none; padding: 0.375em; border-radius: 0.5em; min-width: 1.75em;">X</button> </div> <div v-if="showPlane == 2" style="display: flex; justify-content: space-around;"> <div> <input type="number" style="width: 3em; border-style: solid;" v-model="newitemsvalue"> <button v-on:click="showPlane = 0; items = parseInt(newitemsvalue); showPlane = 0" style="border: none; padding: 0.375em; border-radius: 0.5em;">Zu Wert ändern</button> </div> <button v-on:click="showPlane = 0" style="border: none; padding: 0.375em; border-radius: 0.5em; min-width: 1.75em;">X</button> </div> </div> </div>'
})

Vue.component("fuellstand-anzeige", {
    props: ["product", "index"],
    data: function() {return {watchdog: false}},
    computed: {
        name: function() {
            return this.product.name
        },
        items: function() {
            return this.product.stock
        },
        itemsmax: function() {
            return this.product.stockmax
        }
    },
    watch: {
        watchdog: function() {
            if (this.watchdog) {
                console.log("product")
                this.$emit('datachange', {'product': this.product, 'index': this.index});
            }
            this.watchdog = false
        }
    },
    template: `<fuellstand-anzeige-provider v-bind:name="name" v-bind:items="items" v-on:input="product.stock = $event; watchdog=true" v-bind:itemsmax="itemsmax"></fuellstand-anzeige-provider>`
})
Vue.component ("device", {
    props: ["device", "index"],
    data: function() {return {watchdog: false}},
    computed: {
        products: function() {
            return this.device.items
        },
        name: function() {
            return this.device.name
        }
    },
    watch: {
        watchdog: function() {
            if (this.watchdog) {
                console.log("product")
                this.$emit('datachange', {'device': this.device, 'index': this.index});
            }
            this.watchdog = false
        }
    },
    template: `
    <div style = "border-radius: 20px; box-shadow: 5px 5px 10px grey; padding: 5px 10px 20px 10px; margin: 7.5px;">
    <h1>{{ name }}</h1>
    <fuellstand-anzeige v-for="(product, index) in products" v-bind:product="product" v-bind:index="index" v-on:datachange="device.items[$event.index] = $event.product; watchdog=true"></fuellstand-anzeige>
    </div>
    `
})
Vue.component ("device-list", {
    props: ["data"],
    data: function() {return {watchdog: false}},
    watch: {
        watchdog: function() {
            if (this.watchdog) {
                console.log("product")
                db.setData("devices", this.data)
            }
            this.watchdog = false
        }
    },
    template: `
    <div>
    <device v-for="(device, index) in data" v-bind:device="device" v-bind:index="index" v-on:datachange="data[$event.index] = $event.device; watchdog=true"></device>
    </div>
    `
})
//Components end

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/; SameSite=Strict";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var login = new Vue({
    el: '#login-screen',
    data: {
        email: getCookie("email"),
        password: "",
        showLoginScreen: false,
        showErrorMsg: false
        },
        methods: {
        login: function(email, password) {
            setCookie("email", email, 365)
            db.signUserIn(email, password)
        }
    }
})

export function showLoginScreen() {
    login.showLoginScreen = true;
}

export function dismissLoginScreen() {
    login.showErrorMsg = false;
    login.showLoginScreen = false;
}

export function showErrorMsg() {
    login.showErrorMsg = true;
}

db.getData("devices")

export function dataReturn(data) {
    automat.deviceList.devices = data
    console.log(automat.deviceList)
}

var automat = new Vue ({
    el: "#app",
    data: {
        deviceList: {devices: ""}
    }
})