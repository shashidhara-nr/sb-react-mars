import PropTypes from "prop-types";

export const Folder = ({width, height, bgColor}: {width?: string, height?: string, bgColor?: string}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.6667 1.33333C11.6667 0.596953 11.0697 0 10.3333 0H1.33333C0.596954 0 0 0.596954 0 1.33333V10.3333C0 11.0697 0.596953 11.6667 1.33333 11.6667H10.3333C11.0697 11.6667 11.6667 11.0697 11.6667 10.3333V1.33333ZM3.82149 10L10 3.82149V1.66667H7.84518L1.66667 7.84518V10H3.82149ZM10 6.17851L6.17851 10H10V6.17851ZM1.66667 5.48816L5.48816 1.66667H1.66667V5.48816Z" fill={bgColor}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M1.33333 15C0.596953 15 0 15.597 0 16.3333V25.3333C0 26.0697 0.596953 26.6667 1.33333 26.6667H10.3333C11.0697 26.6667 11.6667 26.0697 11.6667 25.3333V16.3333C11.6667 15.597 11.0697 15 10.3333 15H1.33333ZM1.66667 25V16.6667H10V25H1.66667Z" fill={bgColor}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M15 16.3333C15 15.597 15.597 15 16.3333 15H25.3333C26.0697 15 26.6667 15.597 26.6667 16.3333V25.3333C26.6667 26.0697 26.0697 26.6667 25.3333 26.6667H16.3333C15.597 26.6667 15 26.0697 15 25.3333V16.3333ZM16.6667 16.6667V25H25V16.6667H16.6667Z" fill={bgColor}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16.3333 0C15.597 0 15 0.596953 15 1.33333V10.3333C15 11.0697 15.597 11.6667 16.3333 11.6667H25.3333C26.0697 11.6667 26.6667 11.0697 26.6667 10.3333V1.33333C26.6667 0.596953 26.0697 0 25.3333 0H16.3333ZM16.6667 10V1.66667H25V10H16.6667Z" fill={bgColor}/>
    </svg>
  );
};

Folder.defaultProps = {
  width: "27",
  height: "27",
  bgColor: '#02070D',
};

Folder.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  bgColor: PropTypes.string
};
