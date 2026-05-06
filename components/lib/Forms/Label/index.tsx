import React from 'react';
interface LabelProps {
  /** The text to display */
  children: React.ReactNode;
  /** The id of the input element */
  htmlFor: string;
  label: string;
}

const Label = ({
  children,
  htmlFor,
  label,
}: LabelProps & {
  /** The id of the input element */
  htmlFor: string;
}) => {
  return (
    <label htmlFor={htmlFor}>
      {label}
      {children}
    </label>
  );
};

export default Label;
