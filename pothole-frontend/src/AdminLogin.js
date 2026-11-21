import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { Visibility, VisibilityOff, AdminPanelSettings } from "@mui/icons-material";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@example.com" && password === "securepassword123") {
      navigate("/admin-dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc, #cfdef3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Card
          elevation={10}
          sx={{
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "20px",
            p: 4,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          }}
        >
          <CardContent>
            <Stack spacing={2} alignItems="center" mb={3}>
              <AdminPanelSettings sx={{ fontSize: 50, color: "#1976d2" }} />
              <Typography variant="h5" color="textPrimary">
                Admin Login
              </Typography>
            </Stack>

            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  background: "#1976d2",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  paddingY: "0.8rem",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#125ea8",
                  },
                }}
              >
                Log In
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default AdminLogin;
