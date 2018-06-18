import React from "react";
import styled from "styled-components";
import mouse from "./img/mouse.jpg";
import { buttFontsCss } from "./butt-fonts";
import dagger from "noto-emoji/svg/emoji_u1f5e1.svg";

const CardDesignBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #eee;
`;

const WIDTH = 350;
const HEIGHT = 535;
const TEXT_HEIGHT = 50;

const Image = styled.img`
  height: ${HEIGHT}px;
`;

const Centered = styled.div`
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
`;

const CardSVG = styled.svg``;

export default class CardDesign extends React.Component {
  adjustText(textNode) {
    const bb = textNode.getBBox();
    console.log(bb);
    const PADDING = 20;
    const paddedMaxWidth = WIDTH - PADDING;

    if (bb.width < paddedMaxWidth) {
      return;
    }
    var widthTransform = paddedMaxWidth / bb.width;
    const oldX = bb.width / 2;
    const newX = oldX * widthTransform;
    const dx = oldX - newX;

    const oldHeight = bb.height;
    const newHeight = bb.height * widthTransform;
    const oldY = bb.height / 2;
    const newY = oldY * widthTransform;
    const dy = oldY / widthTransform - newY;
    textNode.setAttribute(
      "transform",
      `matrix(${widthTransform}, 0, 0, ${widthTransform}, 0, 0), translate(${dx}, ${dy})`
    );
  }
  render() {
    return (
      <CardDesignBox>
        <Centered>
          <CardSVG
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <style type="text/css">{buttFontsCss}</style>
            </defs>
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#202124" />
            <rect
              x="0"
              y="0"
              width={WIDTH}
              height={TEXT_HEIGHT}
              fill="#202124"
            />
            <text
              id="t1"
              textAnchor="middle"
              x={WIDTH / 2}
              y="35"
              fill="white"
              lengthAdjust="spacing"
              style={{ font: "30px ButtTitle" }}
              ref={ref => this.adjustText(ref)}
            >
              Stinky Rat
            </text>
            <image
              x="0"
              y={TEXT_HEIGHT}
              width={WIDTH}
              height={WIDTH}
              xlinkHref={mouse}
            />
          </CardSVG>
        </Centered>
      </CardDesignBox>
    );
  }
}
