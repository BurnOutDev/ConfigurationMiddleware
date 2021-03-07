import React from "react";
import IFrame from "react-iframe";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

const Gambling = () => {
  return (
    <div style={{ marginLeft: -55, marginRight: -50, marginTop: -64 }}>
      <IFrame
        url="http://localhost:4200"
        id="myId"
        height={getWindowDimensions().height - 50}
        width={getWindowDimensions().width - 500}
        className="myClassname"
        display="initial"
        position="relative"
      />
      <div></div>
    </div>
  );
};

export { Gambling };
