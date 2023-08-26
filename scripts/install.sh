#!/bin/sh

. 'scripts/preamble.sh'

yarn install "$@"

. 'scripts/setup-project-fragment.sh'
