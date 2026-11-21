import React from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, Button } from "@mui/material";

const Sidebar = () => {
  const navigate = useNavigate();

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
        {/* Admin Dashboard Button */}
        <ListItem>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/admin-login")}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              color: "white",
              mt: 2,
            }}
          >
            Admin Dashboard
          </Button>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
