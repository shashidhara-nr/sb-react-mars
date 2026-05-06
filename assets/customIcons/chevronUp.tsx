import PropTypes from "prop-types";

export const ChevronUp = ({width, height, bgColor}: {width?: string, height?: string, bgColor?: string}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.2723 7.75153C12.5817 7.02032 11.4183 7.02032 10.7277 7.75153L2.95474 15.9818C2.67033 16.2829 2.6839 16.7576 2.98503 17.042C3.28617 17.3264 3.76085 17.3128 4.04526 17.0117L11.8183 8.78147C11.9169 8.67701 12.0831 8.67701 12.1818 8.78147L19.9547 17.0117C20.2392 17.3128 20.7138 17.3264 21.015 17.042C21.3161 16.7576 21.3297 16.2829 21.0453 15.9818L13.2723 7.75153Z" fill={bgColor}/>
    </svg>
  );
};

ChevronUp.defaultProps = {
  width: "24",
  height: "24",
  bgColor: '#0051FF',
};

ChevronUp.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  bgColor: PropTypes.string
};
