import React from 'react';

import config from 'configs/app';
import useAddChainClick from 'lib/web3/useAddChainClick';
import useProvider from 'lib/web3/useProvider';
import { WALLETS_INFO } from 'lib/web3/wallets';
import { Button } from 'toolkit/chakra/button';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  source: 'Footer' | 'Top bar';
  onAddSuccess?: () => void;
}

const NetworkAddToWallet = ({ source, onAddSuccess }: Props) => {
  const { data: { wallet } = {} } = useProvider();

  const handleClick = useAddChainClick({ source, onSuccess: onAddSuccess });

  if (!wallet) {
    return null;
  }

  const walletInfo = WALLETS_INFO[wallet];

  return (
 <Button
  variant="outline"
  size="md"
  px={ 4 }
  py={ 2 }
  gap={ 2 }
  borderWidth="1.5px"
  borderRadius="md"
  color="blue.400"
  borderColor="blue.400"
  onClick={ handleClick }
  _hover={{
    color: 'blue.300',
    borderColor: 'blue.300',
    bg: 'blue.900',
  }}
>
  <IconSvg name={ walletInfo.icon } boxSize={ 4 }/>
  Add { config.chain.name }
</Button>


  );
};

export default React.memo(NetworkAddToWallet);
