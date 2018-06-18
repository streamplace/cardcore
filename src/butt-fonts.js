import buttTitleUrl from "./fonts/Open_Sans/OpenSans-ExtraBold.ttf";
import buttTextUrl from "./fonts/Roboto/Roboto-Medium.ttf";
export const buttFonts = ["ButtTitle", "ButtText"];

export const buttFontsCss = `
  @font-face {
    font-family: 'ButtTitle';
    src: url('${buttTitleUrl}') format("truetype");
  }

  @font-face {
    font-family: 'ButtText';
    src: url('${buttTextUrl}') format("truetype");
  }
`;

export { buttTitleUrl, buttTextUrl };
