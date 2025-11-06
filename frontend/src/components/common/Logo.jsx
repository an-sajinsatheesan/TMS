import PropTypes from 'prop-types';

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <circle cx="8" cy="8" r="6" fill="#F06A6A" />
        <circle cx="24" cy="8" r="6" fill="#FCB900" />
        <circle cx="16" cy="20" r="6" fill="#F06A6A" />
      </svg>
      <span className="text-2xl font-semibold text-gray-900">asana</span>
    </div>
  );
};

Logo.propTypes = {
  className: PropTypes.string
};

export default Logo;
