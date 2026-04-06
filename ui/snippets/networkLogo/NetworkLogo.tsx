import { chakra } from '@chakra-ui/react';
import React from 'react';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import { useColorModeValue } from 'toolkit/chakra/color-mode';
import { Image } from 'toolkit/chakra/image';
import IconSvg from 'ui/shared/IconSvg';

import { INVERT_FILTER } from './consts';

const LogoFallback = () => {
  return (
    <IconSvg
      name="networks/logo-placeholder"
      width="120px"
      height="24px"
      color={{ base: 'blue.600', _dark: 'white' }}
      aria-label="Network logo placeholder"
    />
  );
};

type Props = {
  className?: string;
};

const NetworkLogo = ({ className }: Props) => {
  const logoSrc = useColorModeValue('/icons/LogoLight.svg', '/icons/Logo.svg');

  const filterValue = useColorModeValue(
    undefined,
    !config.UI.navigation.logo.dark ? INVERT_FILTER : undefined
  );

  return (
    <chakra.a
      className={className}
      href={route({ pathname: '/' })}
      aria-label="Link to main page"
      display="flex"
      alignItems="center"
    >
      <Image
        h={{ base: '32px', lg: '40px' }}
        w={{ base: 'auto', lg: 'auto' }}
        skeletonWidth="120px"
        src={logoSrc}
        alt="nowa Logo"
        objectFit="contain"
        objectPosition="center"
      />
    </chakra.a>
  );
};


export default React.memo(chakra(NetworkLogo));
