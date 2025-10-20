import React from "react";
import YouTube from "react-youtube";
import { debugLog } from "../config/debug";

/**
 * AutoUnmuteYouTube Component
 *
 * Displays a YouTube video that automatically unmutes when ready.
 * Used to show a celebration video when a player wins the game.
 *
 * Features:
 * - Auto-play functionality
 * - Automatic unmuting
 * - Fixed positioning for overlay effect
 * - No controls for seamless experience
 */
class AutoUnmuteYouTube extends React.Component {
  /**
   * Handle video ready event - unmute the video
   */
  onReady(event: any) {
    debugLog("YOUTUBE_PLAYER", "Video ready, unmuting");
    // access to player in all event handlers via event.target
    event.target.unMute();
  }

  render() {
    debugLog("YOUTUBE_PLAYER", "Rendering YouTube player");

    const opts = {
      height: "600",
      width: "1000",
      playerVars: {
        autoplay: 1,
        controls: 0,
        mute: 1,
      },
    };

    return (
      <YouTube
        style={{ position: "absolute", zIndex: "123" }}
        videoId="co9En_Lczkc"
        opts={opts}
        onReady={this.onReady}
      />
    );
  }
}

export default AutoUnmuteYouTube;
