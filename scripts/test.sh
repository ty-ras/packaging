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
  TYRAS_LIB_VALIDATION="$(extract_tyras_lib_validation 2)"
  mkdir -p "${TYRAS_LIB_DIR}/src/__test__/"
  cp -r './test-components/backend/.' "${TYRAS_LIB_DIR}/src/__test__/"
  cp -r "./test-components/openapi-${TYRAS_LIB_VALIDATION}/." "${TYRAS_LIB_DIR}/src/__test__"
  cp -r "./test-components/protocol-${TYRAS_LIB_VALIDATION}/." "${TYRAS_LIB_DIR}/src/__test__/api/"
elif [[ "${TYRAS_LIB_NAME}" == frontend-* ]]; then
  mkdir -p "${TYRAS_LIB_DIR}/src/__test__/"
  cp -r './test-components/frontend/.' "${TYRAS_LIB_DIR}/src/__test__/"
  TYRAS_CLIENT_KIND="$(echo "${TYRAS_LIB_NAME}" | cut -d '-' -f 2)"
  if [[ -d "./test-components/frontend-${TYRAS_CLIENT_KIND}" ]]; then
    TYRAS_CLIENT_KIND='generic'
  fi
  cp -r "./test-components/frontend-${TYRAS_CLIENT_KIND}/." "${TYRAS_LIB_DIR}/src/__test__/"
  cp -r "./test-components/protocol-$(extract_tyras_lib_validation 1)/." "${TYRAS_LIB_DIR}/src/__test__/backend/"
fi

yarn run "test:${TYRAS_TEST_MODE}" "$@"
