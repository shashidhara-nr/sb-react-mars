import PropTypes from "prop-types";

export const BackArrow = ({width, height, bgColor}: {width?: string, height?: string, bgColor?: string}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M11.0592 1.99C10.8696 1.78924 10.5532 1.7802 10.3524 1.96981L4.86561 7.1518C4.37813 7.61219 4.37813 8.38777 4.86561 8.84816L10.3524 14.0302C10.5532 14.2198 10.8696 14.2107 11.0592 14.01C11.2488 13.8092 11.2398 13.4927 11.039 13.3031L5.55223 8.12115C5.48259 8.05538 5.48259 7.94458 5.55223 7.87881L11.039 2.69682C11.2398 2.50722 11.2488 2.19076 11.0592 1.99Z" fill={bgColor}/>
      </g>
    </svg>

  );
};

BackArrow.defaultProps = {
  width: "16",
  height: "16",
  bgColor: '#0051FF',
};

BackArrow.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  bgColor: PropTypes.string
};
