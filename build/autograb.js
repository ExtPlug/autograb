

define('extplug/autograb/main',['require','exports','module','extplug/Plugin','plug/core/Events','plug/collections/playlists','plug/models/currentMedia','plug/events/MediaInsertEvent','plug/events/MediaGrabEvent'],function (require, exports, module) {

  var Plugin = require('extplug/Plugin');
  var Events = require('plug/core/Events');
  var playlists = require('plug/collections/playlists');
  var currentMedia = require('plug/models/currentMedia');
  var InsertEvent = require('plug/events/MediaInsertEvent');
  var GrabEvent = require('plug/events/MediaGrabEvent');

  var Autograb = Plugin.extend({
    name: 'Autograb',
    description: 'Grabs every song you hear, automatically.',

    settings: {
      stealth: {
        type: 'boolean',
        label: 'Stealth Mode',
        description: 'Grabs in secret, without showing the rest of the room.',
        'default': false
      },
      playlist: {
        type: 'playlist',
        label: 'Playlist'
      }
    },

    enable: function enable() {
      this.listenTo(API, API.ADVANCE, this.grab);
    },

    grab: function grab() {
      if (!currentMedia.get('historyID') ||
      // you can't grab your own songs
      API.getDJ().id === API.getUser().id) {
        return;
      }
      var playlistId = this.settings.get('playlist');
      if (this.settings.get('stealth')) {
        var media = currentMedia.get('media');
        if (media) {
          media = media.clone();
          media.unset('id');
          var playlist = playlists.get(playlistId);
          Events.dispatch(new InsertEvent(InsertEvent.INSERT, playlist, [media], true, // append to playlist
          1 // amount of items we expect to add
          ));
        }
      } else {
          Events.dispatch(new GrabEvent(GrabEvent.GRAB, playlistId, currentMedia.get('historyID')));
        }
    }
  });

  module.exports = Autograb;
});
