define(function (require, exports, module) {

  const Plugin = require('extplug/Plugin');
  const Events = require('plug/core/Events');
  const playlists = require('plug/collections/playlists');
  const currentMedia = require('plug/models/currentMedia');
  const InsertEvent = require('plug/events/MediaInsertEvent');
  const GrabEvent = require('plug/events/MediaGrabEvent');

  const Autograb = Plugin.extend({
    name: 'Autograb',
    description: 'Grabs every song you hear, automatically.',

    settings: {
      stealth: {
        type: 'boolean',
        label: 'Stealth Mode',
        description: 'Grabs in secret, without showing the rest of the room.',
        default: false
      },
      playlist: {
        type: 'playlist',
        label: 'Playlist'
      }
    },

    enable() {
      this.listenTo(API, API.ADVANCE, this.grab);
    },

    grab() {
      if (!currentMedia.get('historyID') ||
          // you can't grab your own songs
          API.getDJ().id === API.getUser().id) {
        return;
      }
      let playlistId = this.settings.get('playlist');
      if (this.settings.get('stealth')) {
        let media = currentMedia.get('media');
        if (media) {
          media = media.clone();
          media.unset('id');
          let playlist = playlists.get(playlistId);
          Events.dispatch(new InsertEvent(
            InsertEvent.INSERT,
            playlist,
            [ media ],
            true, // append to playlist
            1 // amount of items we expect to add
          ));
        }
      }
      else {
        Events.dispatch(new GrabEvent(
          GrabEvent.GRAB,
          playlistId,
          currentMedia.get('historyID')
        ));
      }
    }
  });

  module.exports = Autograb;

});
