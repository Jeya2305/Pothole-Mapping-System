import React from "react";
import { Link } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#333",
          color: "white",
        },
      }}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/map">
          <ListItemText primary="Pothole Map" />
        </ListItem>
        <ListItem button component={Link} to="/sensor">
          <ListItemText primary="Sensor Data" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
