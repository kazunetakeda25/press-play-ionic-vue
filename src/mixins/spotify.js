export default {
  methods: {
    // Test to see if item has images
    spotifyItemHasImages(item) {
      if (item.type == "artist" || item.type == "album") {
        return (
          Object.prototype.hasOwnProperty.call(item, "images") &&
          item.images.length > 0
        );
      }
      if (item.type == "track") {
        return (
          Object.prototype.hasOwnProperty.call(item, "album") &&
          Object.prototype.hasOwnProperty.call(item.album, "images") &&
          item.album.images.length > 0
        );
      }
      if (item.type == "genre") {
        return (
          Object.prototype.hasOwnProperty.call(item, "icons") &&
          item.icons.length > 0
        );
      }
    },

    // Returns a formatted Spotify name
    getSpotifyItemName(item) {
      return item.name + (item.artists ? " - " + item.artists[0].name : "");
    },

    // Returns the Spotify image URL
    // @TODO: Add a size parameter for large/medium/small image sizes
    getSpotifyItemImage(item) {
      let image = null;
      if (item.type == "artist" || item.type == "album") {
        image = item.images[0].url;
      }
      if (item.type == "track") {
        image = item.album.images[0].url;
      }
      if (item.type == "genre") {
        image = item.icons[0].url;
      }
      return image;
    },

    // Capitalizes item type
    getSpotifyItemType(item) {
      return item.type.charAt(0).toUpperCase() + item.type.slice(1);
    },

    // Returns only the necessary Spotify data for storage
    getSpotifyItemDataStorage(item) {
      if (!Object.prototype.hasOwnProperty.call(item, "timestamp")) {
        let data = {};

        data.id = item.id;
        data.href = item.href;
        data.name = item.name;
        data.type = item.type;

        if (item.type == "track") {
          data.album = {
            id: item.album.id,
            href: item.href,
            name: item.album.name
          };
        }

        if (
          Object.prototype.hasOwnProperty.call(item, "artists") &&
          item.artists.length > 0
        ) {
          data.artists = [];
          item.artists.forEach(function (artist) {
            data.artists.push({
              id: artist.id,
              href: artist.href,
              name: artist.name
            });
          });
        }

        if (this.spotifyItemHasImages(item)) {
          if (item.type == "artist" || item.type == "album") {
            data.images = item.images;
          }
          if (item.type == "track") {
            data.album.images = item.album.images;
          }
          if (item.type == "genre") {
            data.icons = item.icons;
          }
        }

        return data;
      } else {
        return item;
      }
    }
  }
};
