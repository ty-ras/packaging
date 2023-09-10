/**
 * @file This file contains fake FE config for tests.
 */

import getPort from "@ava/get-port";

export default {
  backend: `http://localhost:${await getPort()}`,
};
