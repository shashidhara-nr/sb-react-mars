import PropTypes from "prop-types";

export const Status = ({ width = 20, height = 20 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1052_12558)">
      <rect width="40" height="40" fill="white"/>
      <circle cx="20" cy="20" r="19.5" fill="#F5FAF7" stroke="#BFE0CC"/>
      <circle cx="20" cy="20" r="6" fill="#008545"/>
      </g>
      <defs>
      <clipPath id="clip0_1052_12558">
      <rect width="40" height="40" fill="white"/>
      </clipPath>
      </defs>
    </svg>

  );
};

Status.defaultProps = {
};

Status.propTypes = {
};
