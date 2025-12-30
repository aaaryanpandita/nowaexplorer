import { chakra } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import { Alert } from 'toolkit/chakra/alert';

interface Props {
  isLoading?: boolean;
  className?: string;
}

const TestnetWarning = ({ isLoading, className }: Props) => {
  if (!config.chain.isTestnet) {
    return null;
  }

  return (
  );
};

export default React.memo(chakra(TestnetWarning));
