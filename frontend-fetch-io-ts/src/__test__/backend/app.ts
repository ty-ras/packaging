/**
 * @file This file contains code exposing the TyRAS api call callback factory.
 */

import * as tyras from "../..";
import config from "../config";

export default tyras.createAPICallFactory(config.backend).withHeaders({});
