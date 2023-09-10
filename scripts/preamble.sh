set -e

TYRAS_ROOT_DIR="$(pwd)"

# Always use Alpine-based image
TYRAS_NODE_VERSION="$(cat "${TYRAS_ROOT_DIR}/versions/node")-alpine"

TYRAS_LIB_DIR="$1"

if [ -z "${TYRAS_LIB_DIR}" ]; then
  echo 'Please specify library directory as argument' 1>&2
  exit 1
fi
shift

TYRAS_LIB_NAME="$(basename "${TYRAS_LIB_DIR}")"

yarn ()
{
  docker run \
    --rm \
    -t \
    --volume "${TYRAS_ROOT_DIR}/code/:${TYRAS_ROOT_DIR}/code/:rw" \
    --volume "${TYRAS_ROOT_DIR}/scripts/:${TYRAS_ROOT_DIR}/scripts/:ro" \
    --volume "${TYRAS_ROOT_DIR}/.yarn/:/yarn_dir/:rw" \
    --entrypoint yarn \
    --workdir "${TYRAS_ROOT_DIR}/${TYRAS_LIB_DIR}" \
    --env YARN_CACHE_FOLDER="/yarn_dir/" \
    --env NODE_PATH="${TYRAS_ROOT_DIR}/${TYRAS_LIB_DIR}/node_modules" \
    "node:${TYRAS_NODE_VERSION}" \
    "$@"
}

extract_tyras_lib_validation ()
{
  # With arg "2" it will get 'io-ts' from 'backend-express-io-ts-openapi' and 'zod' from 'backend-node-zod-openapi'
  # With arg "1" it will get 'io-ts' from 'frontend-fetch-io-ts' and 'zod' from 'frontend-axios-zod'
  echo "${TYRAS_LIB_NAME}" | cut -d '-' -f 3- | rev | cut -d '-' -f "${1}-" | rev
}