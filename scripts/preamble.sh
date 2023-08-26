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

