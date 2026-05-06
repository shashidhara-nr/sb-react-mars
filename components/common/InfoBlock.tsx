import React from 'react';
import { Inforblock } from 'dist/standard-bank-react';

type InfoBlockProps = {
  backgroundColor?: string;
  description?: string;
  title?: string;
  width?: string | number;
  color?: string;
  alertIconStyle?: 'circle' | 'triangle';
  resultsFound?: boolean;
  entityType?: 'bank' | 'company';
};

const InfoBlock: React.FC<InfoBlockProps> = ({
  backgroundColor = '#FFFFFF',
  description = '',
  title = '',
  width = '100%',
  color,
  alertIconStyle = 'circle',
  resultsFound = false,
  entityType = 'bank',
}) => {
  const finalTitle = title || (resultsFound ? 'Results found' : 'No result found');
  
  let finalDescription = description;
  if (!description) {
    if (resultsFound) {
      finalDescription = entityType === 'company' 
        ? 'Select the correct company from the list.' 
        : 'Select the correct bank from the list.';
    } else {
      finalDescription = entityType === 'company'
        ? 'Enter more company details above and try again, or fill in the information manually.'
        : 'Enter more bank details above and try again, or fill in the information manually.';
    }
  }
  
  return (
    <Inforblock
      backgroundColor={backgroundColor}
      description={finalDescription}
      title={finalTitle}
      width={width as any}
      color={color || '#999999'}
      alertIconStyle={alertIconStyle}
    />
  );
};

export default InfoBlock;
