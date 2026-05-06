import PropTypes from "prop-types";

export const ArrowRightIcon = ({width, height, bgColor}: {width?: string, height?: string, bgColor?: string}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Dots */}
      <circle cx="4" cy="6" r="2" fill={bgColor || '#0051FF'}/>
      <circle cx="4" cy="12" r="2" fill={bgColor || '#0051FF'}/>
      <circle cx="4" cy="18" r="2" fill={bgColor || '#0051FF'}/>
      {/* Lines */}
      <line x1="12" y1="6" x2="20" y2="6" stroke={bgColor || '#0051FF'} strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="12" x2="20" y2="12" stroke={bgColor || '#0051FF'} strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="20" y2="18" stroke={bgColor || '#0051FF'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

ArrowRightIcon.defaultProps = {
  width: "24",
  height: "24",
  bgColor: '#0051FF',
};

ArrowRightIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  bgColor: PropTypes.string
};
