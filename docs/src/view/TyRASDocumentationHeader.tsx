import {
  createSignal,
  createMemo,
  batch,
  type Accessor,
  type Setter,
  For,
  Show,
} from "solid-js";
import {
  Box,
  AppBar,
  Typography,
  Toolbar,
  Stack,
  Button,
  Menu,
  MenuItem,
} from "@suid/material";
import { KeyboardArrowDown } from "@suid/icons-material";
import * as routing from "../structure";

/* eslint-disable sonarjs/no-duplicate-string */

// TODO Cypress tests to verify that all combinations work

// Notice: we can't destructure props in Solid: https://github.com/solidjs/solid/discussions/287
export default function TyRASDocumentation(props: DocumentationHeaderProps) {
  const currentServer = createMemo(() => {
    const params = props.params();
    return params.kind === "protocol" || params.kind === "client"
      ? undefined
      : {
          ...params.server,
          items:
            routing.tyrasVersions.specific[params.dataValidation].server[
              params.server.name
            ],
        };
  });

  const currentClient = createMemo(() => {
    const params = props.params();
    return params.kind === "protocol" || params.kind === "server"
      ? undefined
      : {
          ...params.client,
          items:
            routing.tyrasVersions.specific[params.dataValidation].client[
              params.client.name
            ],
        };
  });

  const maybeProtocolVersions = createMemo(() => {
    const params = props.params();
    return params.kind === "protocol"
      ? {
          params,
          items: routing.tyrasVersions.protocol[params.dataValidation],
        }
      : undefined;
  });
  return (
    <Box sx={{ flexGrow: 1 }} component="header">
      <AppBar position="static">
        <Toolbar>
          {/* Header */}
          <Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              TyRAS
            </Typography>
          </Box>
          {/* Navigation */}
          <MenuDropDown
            setParams={props.setParams}
            kindText="Data Validation"
            items={routing.tyrasStructure.dataValidation}
            currentlySelected={() => props.params().dataValidation}
            getParamsForItem={(dataValidation) =>
              changeDataValidation(props.params(), dataValidation)
            }
          />
          <Show when={maybeProtocolVersions()}>
            {(protocolVersions) => (
              <MenuDropDown
                setParams={props.setParams}
                kindText="Protocol version"
                items={protocolVersions().items}
                currentlySelected={() =>
                  protocolVersions().params.protocolVersion
                }
                getParamsForItem={(protocolVersion) =>
                  changeProtocolVersion(
                    protocolVersions().params,
                    protocolVersion,
                  )
                }
              />
            )}
          </Show>
          <MenuDropDown
            setParams={props.setParams}
            kindText="Server"
            items={SERVERS}
            currentlySelected={() => currentServer()?.name ?? NONE}
            getParamsForItem={(server) =>
              changeServer(props.params(), server === NONE ? undefined : server)
            }
          />
          <MenuDropDown
            setParams={props.setParams}
            kindText="Version"
            items={currentServer()?.items}
            currentlySelected={() => currentServer()?.version ?? NONE}
            getParamsForItem={(serverVersion) => {
              const params = props.params();
              if (
                params.kind === "server-and-client" ||
                params.kind === "server"
              ) {
                return changeServerVersion(params, serverVersion);
              } else {
                throw new Error(
                  "This method must not be called when no server selected",
                );
              }
            }}
          />
          <MenuDropDown
            setParams={props.setParams}
            kindText="Client"
            items={CLIENTS}
            currentlySelected={() => currentClient()?.name ?? NONE}
            getParamsForItem={(client) =>
              changeClient(props.params(), client === NONE ? undefined : client)
            }
          />
          <MenuDropDown
            setParams={props.setParams}
            kindText="Version"
            items={currentClient()?.items}
            currentlySelected={() => currentClient()?.version ?? NONE}
            getParamsForItem={(clientVersion) => {
              const params = props.params();
              if (
                params.kind === "server-and-client" ||
                params.kind === "client"
              ) {
                return changeClientVersion(params, clientVersion);
              } else {
                throw new Error(
                  "This method must not be called when no client selection",
                );
              }
            }}
          />
          {/* Spacer between the navigation and settings */}
          <Box sx={{ ml: "auto" }} />
          {/* Settings (GH link + Theme switcher)*/}
          <Stack direction="row" spacing={1}>
            <Typography>Settings here</Typography>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export interface DocumentationHeaderProps {
  params: Accessor<routing.DocumentationParams>;
  setParams: Setter<routing.DocumentationParams>;
}

function MenuDropDown(props: MenuDropDownProps) {
  const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null);
  const open = () => Boolean(anchorEl());
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box>
      <Button
        id="select-data-validation"
        aria-controls={open() ? "select-data-validation" : undefined}
        aria-haspopup="true"
        aria-expanded={open() ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={(event) => !!props.items && setAnchorEl(event.currentTarget)}
        endIcon={<KeyboardArrowDown />}
        size="small"
        disabled={!props.items}
      >
        {props.kindText}: {props.currentlySelected()}
      </Button>
      <Menu
        anchorEl={anchorEl()}
        open={open()}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "select-data-validation" }}
      >
        <For each={props.items}>
          {(item) => (
            <MenuItem
              onClick={() => {
                batch(() => {
                  handleClose();
                  props.setParams(props.getParamsForItem(item));
                });
              }}
              disableRipple
            >
              {item}
            </MenuItem>
          )}
        </For>
      </Menu>
    </Box>
  );
}

interface MenuDropDownProps {
  kindText: string;
  items: ReadonlyArray<string> | undefined;
  currentlySelected: Accessor<string>;
  getParamsForItem: (item: string) => routing.DocumentationParams;
  setParams: Setter<routing.DocumentationParams>;
}

const NONE = "none";

const SERVERS = [...routing.tyrasStructure.server, NONE];
const CLIENTS = [...routing.tyrasStructure.client, NONE];

const changeDataValidation = (
  params: routing.DocumentationParams,
  dataValidation: string,
): routing.DocumentationParams => {
  switch (params.kind) {
    case "server-and-client":
      return {
        ...params,
        dataValidation,
        server: {
          ...params.server,
          version: deduceServerVersion(
            dataValidation,
            params.server.name,
            undefined,
          ),
        },
        client: {
          ...params.client,
          version: deduceClientVersion(
            dataValidation,
            params.client.name,
            undefined,
          ),
        },
      };
    case "server":
      return {
        ...params,
        dataValidation,
        server: {
          ...params.server,
          version: deduceServerVersion(
            dataValidation,
            params.server.name,
            undefined,
          ),
        },
      };
    case "client":
      return {
        ...params,
        dataValidation,
        client: {
          ...params.client,
          version: deduceClientVersion(
            dataValidation,
            params.client.name,
            undefined,
          ),
        },
      };
    case "protocol":
      return {
        ...params,
        dataValidation,
        protocolVersion: deduceProtocolVersion(dataValidation, undefined),
      };
    default:
      throw new Error("Please add functionality for new data parameters kind");
  }
};

const changeServer = (
  params: routing.DocumentationParams,
  server: string | undefined,
): routing.DocumentationParams => {
  let retVal: routing.DocumentationParams;
  if (server) {
    const servers = routing.tyrasStructure.server;
    if (servers.indexOf(server) < 0) {
      server = servers[0];
    }
    const version = deduceServerVersion(
      params.dataValidation,
      server,
      undefined,
    );
    if (params.kind === "server-and-client" || params.kind === "client") {
      // Kind changes (if needed) to "server-and-client"
      retVal = {
        kind: "server-and-client",
        dataValidation: params.dataValidation,
        client: params.client,
        server: {
          name: server,
          version,
        },
      };
    } else {
      // Kind changes (if needed) to "server"
      retVal = {
        kind: "server",
        dataValidation: params.dataValidation,
        server: {
          name: server,
          version,
        },
      };
    }
  } else {
    if (params.kind === "server-and-client" || params.kind === "client") {
      retVal = {
        kind: "client",
        dataValidation: params.dataValidation,
        client: params.client,
      };
    } else {
      retVal = {
        kind: "protocol",
        dataValidation: params.dataValidation,
        protocolVersion: deduceProtocolVersion(
          params.dataValidation,
          params.kind === "protocol" ? params.protocolVersion : undefined,
        ),
      };
    }
  }

  return retVal;
};

const changeServerVersion = <
  TParams extends
    | routing.DocumentationParamsServer
    | routing.DocumentationParamsServerAndClient,
>(
  params: TParams,
  serverVersion: string | undefined,
): TParams => {
  return {
    ...params,
    server: {
      ...params.server,
      version: deduceServerVersion(
        params.dataValidation,
        params.server.name,
        serverVersion,
      ),
    },
  };
};

const deduceServerVersion = (
  dataValidation: string,
  server: string,
  serverVersion: string | undefined,
) =>
  deduceServerOrClientVersion("server", dataValidation, server, serverVersion);

const changeClient = (
  params: routing.DocumentationParams,
  client: string | undefined,
): routing.DocumentationParams => {
  let retVal: routing.DocumentationParams;
  if (client) {
    const clients = routing.tyrasStructure.client;
    if (clients.indexOf(client) < 0) {
      client = clients[0];
    }
    const version = deduceClientVersion(
      params.dataValidation,
      client,
      undefined,
    );
    if (params.kind === "server-and-client" || params.kind === "server") {
      // Kind changes (if needed) to "server-and-client"
      retVal = {
        kind: "server-and-client",
        dataValidation: params.dataValidation,
        server: params.server,
        client: {
          name: client,
          version,
        },
      };
    } else {
      // Kind changes (if needed) to "client"
      retVal = {
        kind: "client",
        dataValidation: params.dataValidation,
        client: {
          name: client,
          version,
        },
      };
    }
  } else {
    if (params.kind === "server-and-client" || params.kind === "server") {
      retVal = {
        kind: "server",
        dataValidation: params.dataValidation,
        server: params.server,
      };
    } else {
      retVal = {
        kind: "protocol",
        dataValidation: params.dataValidation,
        protocolVersion: deduceProtocolVersion(
          params.dataValidation,
          params.kind === "protocol" ? params.protocolVersion : undefined,
        ),
      };
    }
  }

  return retVal;
};

const changeClientVersion = <
  TParams extends
    | routing.DocumentationParamsClient
    | routing.DocumentationParamsServerAndClient,
>(
  params: TParams,
  clientVersion: string,
): routing.DocumentationParams => {
  return {
    ...params,
    client: {
      ...params.client,
      version: deduceClientVersion(
        params.dataValidation,
        params.client.name,
        clientVersion,
      ),
    },
  };
};

const changeProtocolVersion = (
  params: routing.DocumentationParamsProtocol,
  protocolVersion: string,
): routing.DocumentationParamsProtocol => {
  return {
    ...params,
    protocolVersion,
  };
};

const deduceClientVersion = (
  dataValidation: string,
  client: string,
  clientVersion: string | undefined,
) =>
  deduceServerOrClientVersion("client", dataValidation, client, clientVersion);

const deduceServerOrClientVersion = <
  TClientOrServer extends routing.VersionKind,
>(
  clientOrServer: TClientOrServer,
  dataValidation: string,
  component: string,
  componentVersion: string | undefined,
): string => {
  const versions =
    routing.tyrasVersions.specific[dataValidation][clientOrServer][component];
  const versionIdx = componentVersion ? versions.indexOf(componentVersion) : -1;
  return versions[Math.max(0, versionIdx)];
};

const deduceProtocolVersion = (
  dataValidation: string,
  protocolVersion: string | undefined,
): string => {
  const versions = routing.tyrasVersions.protocol[dataValidation];
  const versionIdx = protocolVersion ? versions.indexOf(protocolVersion) : -1;
  return versions[Math.max(0, versionIdx)];
};
