
import React, { useState } from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";

export default function NavBar({ handleSignOut }) {
  const settings = ["Logout"];
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = (action) => {
    handleCloseUserMenu();
    if (action === "Logout" && handleSignOut) {
      handleSignOut();
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Toolbar sx={{ px: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img
              src="https://allevents.in/img/ae-logo-website-v2.svg"
              alt="All Events in City"
              width="135"
              height="37"
              style={{ marginRight: 10 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: ".8px",
                color: "white",
                display: { xs: "none", sm: "block" },
              }}
            >
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open profile settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt="User Avatar"
                  sx={{
                    bgcolor: "#fff",
                    color: "#1976d2",
                    fontWeight: "bold",
                    border: "2px solid white",
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{
                mt: "45px",
                "& .MuiPaper-root": {
                  borderRadius: 2,
                  boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
                  minWidth: 160,
                },
              }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => handleMenuItemClick(setting)}
                  sx={{ fontWeight: 500 }}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

