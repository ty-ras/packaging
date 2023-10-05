import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
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

export default function TyRASDocumentation() {
  const params = routing.useParams();
  const currentServer =
    params.kind === "protocol" || params.kind === "client"
      ? undefined
      : params.server;
  const currentClient =
    params.kind === "protocol" || params.kind === "server"
      ? undefined
      : params.client;
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
            kindText="Data Validation"
            items={routing.tyrasStructure.dataValidation}
            currentlySelected={params.dataValidation}
            getURLForItem={(dataValidation) => `/${dataValidation}`}
          />
          <MenuDropDown
            kindText="Server"
            items={SERVERS}
            currentlySelected={currentServer?.name ?? NONE}
            getURLForItem={(server) => `/${params.dataValidation}/${server}`}
          />
          <MenuDropDown
            kindText="Version"
            items={
              currentServer
                ? routing.tyrasVersions.specific[params.dataValidation].server[
                    currentServer.name
                  ]
                : undefined
            }
            currentlySelected={currentServer?.name ?? NONE}
            getURLForItem={(serverVersion) =>
              `/${params.dataValidation}/${currentServer?.name}/${serverVersion}`
            }
          />
          <MenuDropDown
            kindText="Client"
            items={CLIENTS}
            currentlySelected={currentClient?.name ?? NONE}
            getURLForItem={(client) =>
              `/${params.dataValidation}/${currentServer?.name ?? NONE}/${
                currentServer?.version ?? NONE
              }/${client}`
            }
          />
          <MenuDropDown
            kindText="Version"
            items={
              currentClient
                ? routing.tyrasVersions.specific[params.dataValidation].client[
                    currentClient.name
                  ]
                : undefined
            }
            currentlySelected={currentClient?.name ?? NONE}
            getURLForItem={(clientVersion) =>
              `/${params.dataValidation}/${currentServer?.name ?? NONE}/${
                currentServer?.version ?? NONE
              }/${currentClient?.name}/${clientVersion}`
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

function MenuDropDown({
  kindText,
  items,
  currentlySelected,
  getURLForItem,
}: MenuDropDownProps) {
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
        onClick={(event) => !!items && setAnchorEl(event.currentTarget)}
        endIcon={<KeyboardArrowDown />}
        size="small"
        disabled={!items}
      >
        {kindText}: {currentlySelected}
      </Button>
      <Menu
        anchorEl={anchorEl()}
        open={open()}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "select-data-validation" }}
      >
        {items?.map((item) => (
          <MenuItem onClick={handleClose} disableRipple>
            <A href={getFullNavigationURL(getURLForItem(item))}>{item}</A>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

interface MenuDropDownProps {
  kindText: string;
  items: ReadonlyArray<string> | undefined;
  currentlySelected: string;
  getURLForItem: (item: string) => string;
}

const NONE = "none";

const SERVERS = [...routing.tyrasStructure.server, NONE];
const CLIENTS = [...routing.tyrasStructure.client, NONE];

const getFullNavigationURL = (maybePartialNavigationURL: string): string => {
  let paramsOrFullURL = routing.parseParamsFromPathname(
    maybePartialNavigationURL,
  );
  if (routing.isNavigate(paramsOrFullURL)) {
    // The given URL was really partial
    paramsOrFullURL = routing.parseParamsFromPathname(paramsOrFullURL);
    if (routing.isNavigate(paramsOrFullURL)) {
      // If we get partial URL again even after rsult of parseParamsFromPathname, we have encountered internal error
      throw new Error(
        `The given partial navigation URL "${maybePartialNavigationURL}" was resolved to be partial even on 2nd attempt, this signals error in URL parsing logic.`,
      );
    }
  }

  return routing.buildNavigationURL(paramsOrFullURL);
};
