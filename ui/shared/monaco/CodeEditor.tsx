import type { SystemStyleObject } from '@chakra-ui/react';
import { Box, Flex, useToken, Center } from '@chakra-ui/react';
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json'; 
import { oneDark } from '@codemirror/theme-one-dark';

import type { File } from './types';
import type { SmartContractExternalLibrary } from 'types/api/contract';

import useIsMobile from 'lib/hooks/useIsMobile';
import { useColorMode } from 'toolkit/chakra/color-mode';
import { useClientRect } from 'toolkit/hooks/useClientRect';
import ErrorBoundary from 'ui/shared/ErrorBoundary';

import CodeEditorBreadcrumbs from './CodeEditorBreadcrumbs';
import CodeEditorSideBar, { CONTAINER_WIDTH as SIDE_BAR_WIDTH } from './CodeEditorSideBar';
import CodeEditorTabs from './CodeEditorTabs';

const TABS_HEIGHT = 35;
const BREADCRUMBS_HEIGHT = 22;
const EDITOR_HEIGHT = 500;

interface Props {
  data: Array<File>;
  remappings?: Array<string>;
  libraries?: Array<SmartContractExternalLibrary>;
  language?: string;
  mainFile?: string;
  contractName?: string;
}

const CodeEditor = ({ data, remappings, libraries, language, mainFile, contractName }: Props) => {
  const [ index, setIndex ] = React.useState(0);
  const [ tabs, setTabs ] = React.useState([ data[index].file_path ]);

  const [ containerRect, containerNodeRef ] = useClientRect<HTMLDivElement>();

  const { colorMode } = useColorMode();
  const [ borderRadius ] = useToken('radii', 'md');
  const isMobile = useIsMobile();

  const editorWidth = containerRect ? containerRect.width - (isMobile ? 0 : SIDE_BAR_WIDTH) : 0;

  const getLanguageExtension = () => {
    switch (language) {
      case 'solidity':
      case 'vyper':
      case 'javascript':
        return [javascript()];
      case 'json':
        return [json()]; // Change this line
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      default:
        return [javascript()];
    }
  };

  const handleSelectFile = React.useCallback((index: number, lineNumber?: number) => {
    setIndex(index);
    setTabs((prev) => prev.some((item) => item === data[index].file_path) ? prev : ([ ...prev, data[index].file_path ]));
  }, [ data ]);

  const handleTabSelect = React.useCallback((path: string) => {
    const index = data.findIndex((item) => item.file_path === path);
    if (index > -1) {
      setIndex(index);
    }
  }, [ data ]);

  const handleTabClose = React.useCallback((path: string, _isActive?: boolean) => {
    setTabs((prev) => {
      if (prev.length > 1) {
        const tabIndex = prev.findIndex((item) => item === path);
        const isActive = _isActive !== undefined ? _isActive : data[index].file_path === path;

        if (isActive) {
          const nextActiveIndex = data.findIndex((item) => item.file_path === prev[(tabIndex === 0 ? 1 : tabIndex - 1)]);
          setIndex(nextActiveIndex);
        }

        return prev.filter((item) => item !== path);
      }

      return prev;
    });
  }, [ data, index ]);

  const renderErrorScreen = React.useCallback(() => {
    return <Center bgColor="gray.800" w="100%" h="100%" borderRadius="md">Oops! Something went wrong!</Center>;
  }, []);

  if (data.length === 1) {
    return (
      <Box height={ `${ EDITOR_HEIGHT }px` } width="100%" ref={ containerNodeRef } borderRadius="md" overflow="hidden">
        <ErrorBoundary renderErrorScreen={ renderErrorScreen }>
          <CodeMirror
            value={ data[index].source_code }
            height={ `${ EDITOR_HEIGHT }px` }
            theme={ colorMode === 'dark' ? oneDark : undefined }
            extensions={ getLanguageExtension() }
            editable={ false }
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: false,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: false,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              searchKeymap: true,
              foldKeymap: true,
              completionKeymap: false,
              lintKeymap: true,
            }}
          />
        </ErrorBoundary>
      </Box>
    );
  }

  return (
    <Flex
      width="100%"
      height={ `${ EDITOR_HEIGHT + TABS_HEIGHT + BREADCRUMBS_HEIGHT }px` }
      position="relative"
      ref={ containerNodeRef }
      overflow={{ base: 'hidden', lg: 'visible' }}
      borderRadius="md"
    >
      <ErrorBoundary renderErrorScreen={ renderErrorScreen }>
        <Box flexGrow={ 1 }>
          <CodeEditorTabs
            tabs={ tabs }
            activeTab={ data[index].file_path }
            mainFile={ mainFile }
            onTabSelect={ handleTabSelect }
            onTabClose={ handleTabClose }
          />
          <CodeEditorBreadcrumbs path={ data[index].file_path }/>
          <Box height={ `${ EDITOR_HEIGHT }px` } overflow="hidden">
            <CodeMirror
              value={ data[index].source_code }
              height={ `${ EDITOR_HEIGHT }px` }
              theme={ colorMode === 'dark' ? oneDark : undefined }
              extensions={ getLanguageExtension() }
              editable={ false }
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                foldGutter: true,
                syntaxHighlighting: true,
                bracketMatching: true,
              }}
            />
          </Box>
        </Box>
        <CodeEditorSideBar
          data={ data }
          onFileSelect={ handleSelectFile }
          selectedFile={ data[index].file_path }
          mainFile={ mainFile }
        />
      </ErrorBoundary>
    </Flex>
  );
};

export default React.memo(CodeEditor);