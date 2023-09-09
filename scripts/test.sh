#!/bin/bash

. 'scripts/preamble.sh'

TYRAS_TEST_MODE="$1"
if [ "${TYRAS_TEST_MODE}" = "run" ] || [ "${TYRAS_TEST_MODE}" = "coverage" ]; then
  if [ "$#" -gt 0 ]; then
    shift
  fi
else
  TYRAS_TEST_MODE='run'
fi

if [[ "${TYRAS_LIB_NAME}" == backend-* ]]; then
  mkdir -p "${TYRAS_LIB_DIR}/src/__test__/"
  cp -r './test-components/backend/.' "${TYRAS_LIB_DIR}/src/__test__/"
  cp -r "./test-components/protocol-$(extract_tyras_lib_validation 2)/." "${TYRAS_LIB_DIR}/src/__test__/api/"
elif [[ "${TYRAS_LIB_NAME}" == frontend-* ]]; then
  cp -r './test-components/frontend/.' "${TYRAS_LIB_DIR}/src/__test__/"
  cp -r "./test-components/protocol-$(extract_tyras_lib_validation 1)/." "${TYRAS_LIB_DIR}/src/__test__/backend/"
fi

yarn run "test:${TYRAS_TEST_MODE}" "$@"
