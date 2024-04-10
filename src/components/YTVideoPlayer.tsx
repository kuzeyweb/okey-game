import React from "react";
import YouTube from "react-youtube";

class AutoUnmuteYouTube extends React.Component {
  onReady(event: any) {
    // access to player in all event handlers via event.target
    event.target.unMute();
  }

  render() {
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
