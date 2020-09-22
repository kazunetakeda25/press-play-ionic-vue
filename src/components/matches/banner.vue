<template>
  <ion-grd>
    <ion-row v-for="(row, r) in rows" :key="'r' + r">
      <ion-col
        size="4"
        v-for="(images, i) in getImageChunks(row)"
        :key="'i' + r + i"
      >
        <ion-grid>
          <ion-row>
            <ion-col size="8" :push="r % 2 == 0 ? 4 : 0">
              <aspect-ratio
                class="img-cover"
                :style="{ 'background-image': `url(${images[0]})` }"
              ></aspect-ratio>
            </ion-col>
            <ion-col size="4" :pull="r % 2 == 0 ? 8 : 0">
              <ion-grid class="align-content-center">
                <ion-row>
                  <ion-col>
                    <aspect-ratio
                      class="img-cover"
                      :style="{ 'background-image': `url(${images[1]})` }"
                    ></aspect-ratio>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col>
                    <aspect-ratio
                      class="img-cover"
                      :style="{ 'background-image': `url(${images[2]})` }"
                    ></aspect-ratio>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-col>
    </ion-row>
  </ion-grd>
</template>
<script>
import chunk from "lodash/chunk";
import shuffle from "lodash/shuffle";
export default {
  props: {
    bannerImages: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  methods: {
    getImageChunks(images) {
      return chunk(images, 3);
    }
  },
  computed: {
    images() {
      let iShuffle = shuffle(this.bannerImages);
      return iShuffle.length > 18 ? chunk(iShuffle, 18)[0] : iShuffle;
    },
    rows() {
      return chunk(this.images, 9);
    }
  }
};
</script>
<style lang="scss" scoped>
ion-grid,
ion-row,
ion-col {
  padding: 0;
}
.img-cover {
  background-position: 50% 50%;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
