import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Supplier } from "../../store/slices/supplierSlice";
import { getSuppliers, deleteSupplier } from "../../api/supplierService";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  TablePagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SupplierForm from "./SupplierForm";

const SupplierList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useSelector((state: RootState) => state.auth);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSuppliers();
      console.log("Fetched suppliers:", data);
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Failed to load suppliers. Please try again.");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id);
        setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
        setSuccess("Supplier deleted successfully");
      } catch (error) {
        console.error("Error deleting supplier:", error);
        setError("Failed to delete supplier. Please try again.");
      }
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedSupplier(undefined);
  };

  const handleSupplierSuccess = (supplier: Supplier) => {
    if (selectedSupplier) {
      // Update existing supplier in the list
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
      setSuccess("Supplier updated successfully");
    } else {
      // Add new supplier to the list
      setSuppliers(prev => [...prev, supplier]);
      setSuccess("Supplier added successfully");
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Show login message if not authenticated
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">
            Please log in to view and manage suppliers.
          </Alert>
        </Box>
      </Container>
    );
  }

  const renderMobileView = () => (
    <Box sx={{ mt: 2 }}>
      {suppliers
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((supplier) => (
          <Card key={supplier.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {supplier.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {supplier.phone}
              </Typography>
              <Typography variant="body2" paragraph>
                {supplier.address}
              </Typography>
              {supplier.gst && (
                <Typography variant="body2" color="text.secondary">
                  GST: {supplier.gst}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
              <IconButton
                onClick={() => handleEdit(supplier)}
                color="primary"
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(supplier.id)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      {suppliers.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No suppliers found. Add your first supplier by clicking the "Add
            Supplier" button.
          </Typography>
        </Box>
      )}
      <TablePagination
        component="div"
        count={suppliers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );

  const renderDesktopView = () => (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>GST Number</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((supplier) => (
                <TableRow key={supplier.id} hover>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.address}</TableCell>
                  <TableCell>{supplier.gst || "-"}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEdit(supplier)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(supplier.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {suppliers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No suppliers found. Add your first supplier by clicking the
                      "Add Supplier" button.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={suppliers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" color="primary">
            Suppliers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              px: 3,
            }}
          >
            Add Supplier
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : isMobile ? (
          renderMobileView()
        ) : (
          renderDesktopView()
        )}
      </Box>

      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <SupplierForm
          editSupplier={selectedSupplier}
          onClose={handleCloseForm}
          onSuccess={handleSupplierSuccess}
        />
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SupplierList; 