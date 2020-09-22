import Vue from "vue";
export default {
  methods: {
    spotifyPlayerListControl(scope, stateParams, Spotify) {
      let listid = stateParams.listid;
      let userid = stateParams.userid;
      scope.listname = stateParams.listname;

      scope.audio = new Audio();

      scope.tracks = [];

      Spotify.getPlaylist(userid, listid).then(function (data) {
        scope.tracks = data.tracks.items;
      });

      scope.playTrack = function (trackInfo) {
        scope.audio.src = trackInfo.track.preview_url;
        scope.audio.play();
      };

      scope.openSpotify = function (link) {
        window.open(link, '_blank', 'location=yes');
      };

      scope.stop = function () {
        if ($scope.audio.src) {
          $scope.audio.pause();
        }
      };

      scope.play = function () {
        if ($scope.audio.src) {
          $scope.audio.play();
        }
      };
    }
  }
};