import PropTypes from "prop-types";

export const CheckCircle = ({width, height, bgColor}: {width?: string, height?: string, bgColor?: string}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 48 48" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M38.356 11.137C38.7523 11.4652 38.8058 12.0506 38.4756 12.4444L18.6033 36.1444C18.4353 36.3448 18.1902 36.4656 17.9281 36.4774C17.6659 36.4893 17.4109 36.3909 17.2253 36.2065L7.28919 26.3315C6.92444 25.969 6.92444 25.3813 7.28919 25.0188C7.65394 24.6563 8.24531 24.6563 8.61006 25.0188L17.823 34.175L37.0405 11.2559C37.3708 10.8621 37.9597 10.8089 38.356 11.137Z" fill={bgColor || '#008533'}/>
    </svg>
  );
};

CheckCircle.defaultProps = {
  width: "27",
  height: "27",
  bgColor: '#0051FF',
};

CheckCircle.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  bgColor: PropTypes.string
};
