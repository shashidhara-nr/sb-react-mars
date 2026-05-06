import PropTypes from "prop-types";

export const Exclamation = ({width, height, bgColor}: {width?: string, height?: string, bgColor?: string}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle opacity="0.2" cx="29" cy="29" r="26.5" stroke={bgColor} strokeWidth="5"/>
      <rect x="4.5" y="4.5" width="49" height="49" rx="24.5" stroke={bgColor}/>
      <path d="M29 31.0007C28.2636 31.0007 27.6667 30.4037 27.6667 29.6673L27.6667 19.6673C27.6667 18.9309 28.2636 18.334 29 18.334C29.7364 18.334 30.3333 18.9309 30.3333 19.6673L30.3333 29.6673C30.3333 30.4037 29.7364 31.0007 29 31.0007Z" fill={bgColor}/>
      <path d="M29 34.334C27.8954 34.334 27 35.2294 27 36.334C27 37.4386 27.8954 38.334 29 38.334C30.1046 38.334 31 37.4386 31 36.334C31 35.2294 30.1046 34.334 29 34.334Z" fill={bgColor}/>
    </svg>
  );
};

Exclamation.defaultProps = {
  width: "58",
  height: "58",
  bgColor: '#E31E46',
};

Exclamation.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  bgColor: PropTypes.string
};
