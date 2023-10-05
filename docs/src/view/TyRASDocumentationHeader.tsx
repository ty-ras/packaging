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

export default function TyRASDocumentation() {
  const params = routing.useParams();
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
          <MenuDropDown kind="server" params={params} kindText="Server" />
          <MenuDropDown
            kind="serverVersion"
            params={params}
            kindText="Version"
          />
          <MenuDropDown kind="client" params={params} kindText="Client" />
          <MenuDropDown
            kind="clientVersion"
            params={params}
            kindText="Version"
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
  getParamsForItem,
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
            <A href={routing.buildNavigationURL(getParamsForItem(item))}>
              {item}
            </A>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

interface MenuDropDownProps {
  kindText: string;
  items: ReadonlyArray<string>;
  currentlySelected: string;
  getURLForItem: (item: string) => string;
}

const NONE = "none";
