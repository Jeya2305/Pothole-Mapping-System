import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';

function AdminDashboardPage() {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendURL = 'https://localhost/potholes'; // update if deployed

  const fetchPotholes = async () => {
    try {
      const res = await fetch(backendURL, {
        credentials: 'include',
      });
      const data = await res.json();
      setPotholes(data);
    } catch (err) {
      console.error('❌ Error fetching potholes:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePothole = async (id) => {
    try {
      const res = await fetch(`https://localhost/potholes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      console.log(result.message);
      fetchPotholes();
    } catch (err) {
      console.error('❌ Error deleting pothole:', err);
    }
  };

  useEffect(() => {
    fetchPotholes();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#121212', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom align="center" color="white" fontWeight="bold">
           Welcome Admin!!
        </Typography>

        <Typography variant="h6" align="center" color="#aaa" mb={4}>
          Pothole Report Dashboard
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
            <CircularProgress color="primary" />
          </Box>
        ) : potholes.length === 0 ? (
          <Typography variant="body1" align="center" color="gray">
            No potholes found.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Latitude</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Longitude</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Severity</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {potholes.map((pothole) => (
                  <TableRow key={pothole.id}>
                    <TableCell sx={{ color: '#ccc' }}>{pothole.lat}</TableCell>
                    <TableCell sx={{ color: '#ccc' }}>{pothole.lng}</TableCell>
                    <TableCell
                      sx={{
                        color: pothole.severity === 'red' ? 'red' : 'yellow',
                        fontWeight: 'bold',
                      }}
                    >
                      {pothole.severity}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => deletePothole(pothole.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}

export default AdminDashboardPage;
