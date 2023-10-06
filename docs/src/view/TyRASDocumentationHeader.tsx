import {
  createSignal,
  createMemo,
  batch,
  type Accessor,
  type Setter,
  For,
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
import * as routing from "../routing";

// TODO Cypress tests to verify that all combinations work

// Notice: we can't destructure props in Solid: https://github.com/solidjs/solid/discussions/287
export default function TyRASDocumentation(props: DocumentationHeaderProps) {
  const currentServer = createMemo(() => {
    const params = props.params();
    return params.kind === "protocol" || params.kind === "client"
      ? undefined
      : params.server;
  });

  const currentClient = createMemo(() => {
    const params = props.params();
    return params.kind === "protocol" || params.kind === "server"
      ? undefined
      : params.client;
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
            items={() => routing.tyrasStructure.dataValidation}
            currentlySelected={() => props.params().dataValidation}
            getURLForItem={(dataValidation) => `/${dataValidation}`}
          />
          <MenuDropDown
            setParams={props.setParams}
            kindText="Server"
            items={() => SERVERS}
            currentlySelected={() => currentServer()?.name ?? NONE}
            getURLForItem={(server) =>
              `/${props.params().dataValidation}/${server}${
                server === NONE ? `/${NONE}` : ""
              }`
            }
          />
          <MenuDropDown
            setParams={props.setParams}
            kindText="Version"
            items={() => {
              const server = currentServer();
              return server
                ? routing.tyrasVersions.specific[props.params().dataValidation]
                    .server[server.name]
                : undefined;
            }}
            currentlySelected={() => currentServer()?.version ?? NONE}
            getURLForItem={(serverVersion) =>
              `/${props.params().dataValidation}/${currentServer()
                ?.name}/${serverVersion}`
            }
          />
          <MenuDropDown
            setParams={props.setParams}
            kindText="Client"
            items={() => CLIENTS}
            currentlySelected={() => currentClient()?.name ?? NONE}
            getURLForItem={(client) =>
              `/${props.params().dataValidation}/${
                currentServer()?.name ?? NONE
              }/${currentServer()?.version ?? NONE}/${client}`
            }
          />
          <MenuDropDown
            setParams={props.setParams}
            kindText="Version"
            items={() => {
              const client = currentClient();
              return client
                ? routing.tyrasVersions.specific[props.params().dataValidation]
                    .client[client.name]
                : undefined;
            }}
            currentlySelected={() => currentClient()?.version ?? NONE}
            getURLForItem={(clientVersion) =>
              `/${props.params().dataValidation}/${
                currentServer()?.name ?? NONE
              }/${currentServer()?.version ?? NONE}/${currentClient()
                ?.name}/${clientVersion}`
            }
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
        <For each={props.items()}>
          {(item) => (
            <MenuItem
              onClick={() => {
                batch(() => {
                  handleClose();
                  props.setParams(
                    routing.parseParamsAndMaybeNewURL(props.getURLForItem(item))
                      .params,
                  );
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
  items: Accessor<ReadonlyArray<string> | undefined>;
  currentlySelected: Accessor<string>;
  getURLForItem: (item: string) => string;
  setParams: Setter<routing.DocumentationParams>;
}

const NONE = "none";

const SERVERS = [...routing.tyrasStructure.server, NONE];
const CLIENTS = [...routing.tyrasStructure.client, NONE];
