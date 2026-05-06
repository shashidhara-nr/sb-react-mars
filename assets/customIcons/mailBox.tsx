import PropTypes from "prop-types";

export const MailBox = ({width, height, bgColor}: {width?: string, height?: string, bgColor?: string}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 21 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M2.91667 0C1.30584 0 0 1.30584 0 2.91667V13.4167C0 15.0275 1.30584 16.3333 2.91667 16.3333H18.0833C19.6942 16.3333 21 15.0275 21 13.4167V2.91667C21 1.30584 19.6942 0 18.0833 0H2.91667ZM19.8333 2.91667C19.8333 1.95017 19.0498 1.16667 18.0833 1.16667H2.91667C1.95017 1.16667 1.16667 1.95017 1.16667 2.91667C1.16667 3.45872 1.43002 3.96697 1.87286 4.27957L10.1636 10.1319C10.3653 10.2742 10.6347 10.2742 10.8364 10.1319L19.1271 4.27957C19.57 3.96697 19.8333 3.45872 19.8333 2.91667ZM1.16667 5.20876L1.20006 5.2327L9.4908 11.085C10.0958 11.5121 10.9042 11.5121 11.5092 11.085L19.7999 5.2327L19.8333 5.20876V13.4167C19.8333 14.3832 19.0498 15.1667 18.0833 15.1667H2.91667C1.95017 15.1667 1.16667 14.3832 1.16667 13.4167V5.20876Z" fill={bgColor}/>
    </svg>
  );
};

MailBox.defaultProps = {
  width: "21",
  height: "17",
  bgColor: '#222E37',
};

MailBox.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  bgColor: PropTypes.string
};
