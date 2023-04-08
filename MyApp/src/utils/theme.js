const COLORS = {
  blue: '#1d74bc',
  transparentBlue: '#1d74bc13',
  transBlue2: '#93dcff',
  white: '#ffffff',
  green: '#52c41a',
  black: '#000',
  grey: '#A9A9A9',
  red: '#f44336',
  blueSky: '#02a9ea'
};

const SHADOW = {
  elevation: 3,
  shadowColor: 'black',
  // shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.25,
  shadowRadius: 8,
};
const SHADOWIOS = {
  elevation: 1,
  shadowColor: 'black',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.15,
  shadowRadius: 5,
};
const SHADOWHEADERBLUE = {
  elevation: 1,
  shadowColor: COLORS.blue,
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.15,
  shadowRadius: 5,
};

export {COLORS, SHADOW, SHADOWIOS, SHADOWHEADERBLUE};
