<template>
  <ion-toolbar>
    <router-link :to="{ name: 'logout' }" v-slot="{ href, navigate }">
      <ion-button fill="clear" expand="block" :href="href" @click="navigate">
        <icon name="log-out"></icon>
        Log Out
      </ion-button>
    </router-link>
  </ion-toolbar>
</template>
