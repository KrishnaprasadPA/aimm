import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  MenuItem,
  Box,
  InputBase,
  IconButton,
  Paper,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { styled, alpha } from "@mui/material/styles";
import AddFactorModal from "./AddFactorModal";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const NavBar = ({
  searchTerm,
  setSearchTerm,
  onSearchInput,
  filteredFactors,
  addFactorToDragArea,
  targetVariables,
  setSelectedTarget,
  addRectangleToGraph,
  adminFactors,
  userFactors,
  openAddFactorModal,
  showAddFactorModal,
  closeAddFactorModal,
  handleAddSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#ff4081" }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          AI Mental Modeler
        </Typography>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search factors…"
            inputProps={{ "aria-label": "search" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onInput={onSearchInput}
          />
        </Search>
        <IconButton
          ref={anchorRef}
          aria-controls={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          color="inherit"
        >
          <AddCircleOutlineIcon />
        </IconButton>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow">
                    <MenuItem onClick={openAddFactorModal}>Add Factor</MenuItem>
                    {filteredFactors.map((factor) => (
                      <MenuItem
                        key={factor._id}
                        onClick={() => {
                          addFactorToDragArea(factor);
                          handleClose();
                        }}
                      >
                        {factor.name}
                      </MenuItem>
                    ))}
                    {targetVariables.map((variable) => (
                      <MenuItem
                        key={variable._id}
                        onClick={() => {
                          setSelectedTarget(variable.name);
                          addRectangleToGraph(variable);
                          handleClose();
                        }}
                      >
                        {variable.name}
                      </MenuItem>
                    ))}
                    {adminFactors.map((factor) => (
                      <MenuItem
                        key={factor._id}
                        onClick={() => {
                          addRectangleToGraph(factor);
                          handleClose();
                        }}
                      >
                        {factor.name}
                      </MenuItem>
                    ))}
                    {userFactors.map((factor) => (
                      <MenuItem
                        key={factor._id}
                        onClick={() => {
                          addRectangleToGraph(factor);
                          handleClose();
                        }}
                      >
                        {factor.name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Toolbar>
      {showAddFactorModal && (
        <AddFactorModal
          onClose={closeAddFactorModal}
          onAddSuccess={handleAddSuccess}
        />
      )}
    </AppBar>
  );
};

export default NavBar;
