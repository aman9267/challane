import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  setChallans as setReduxChallans,
  deleteChallan as deleteReduxChallan,
  Challan,
  ChallanState,
} from "../../store/slices/challanSlice";
import { getChallans, deleteChallan } from "../../api/challanService";
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
  Chip,
  Divider,
  TablePagination,
  Grid,
  Stack,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ChallanForm from "./ChallanForm";
import PrintableChallan from "../PrintableChallan";

const ChallanList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { challans } = useSelector(
    (state: RootState) => state.challan as ChallanState
  );

  const { company } = useSelector((state: RootState) => state.company);
  const [openForm, setOpenForm] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | undefined>(
    undefined
  );

  const [printChallan, setPrintChallan] = useState<Challan | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const downloadChallanPDF = async (
    elementId: string,
    filename: string = "Challan.pdf"
  ) => {
    const input = document.getElementById(elementId);
    if (!input) return alert("Challan element not found");

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuChallan, setMenuChallan] = useState<Challan | null>(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewChallan, setViewChallan] = useState<Challan | null>(null);
  const handleView = (challan: Challan) => {
    setViewChallan(challan);
    setViewDialogOpen(true);
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setViewChallan(null);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    challan: Challan
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuChallan(challan);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuChallan(null);
  };

  useEffect(() => {
    const fetchChallans = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getChallans();
        console.log("Fetched challans:", data);
        dispatch(setReduxChallans(data));
      } catch (error) {
        console.error("Error fetching challans:", error);
        setError("Failed to load challans. Please try again.");
        dispatch(setReduxChallans([]));
      } finally {
        setLoading(false);
      }
    };

    fetchChallans();
  }, [dispatch]);

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getChallans();
      dispatch(setReduxChallans(data));
      setError(null);
    } catch (error) {
      console.error("Error fetching challans:", error);
      setError("Failed to load challans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this challan?")) {
      try {
        await deleteChallan(id);
        dispatch(deleteReduxChallan(id));
        setSuccess("Challan deleted successfully");
      } catch (error) {
        console.error("Error deleting challan:", error);
        setError("Failed to delete challan. Please try again.");
      }
    }
  };

  const handleEdit = (challan: Challan) => {
    setSelectedChallan(challan);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedChallan(undefined);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Show login message if not authenticated
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">
            Please log in to view and manage challans.
          </Alert>
        </Box>
      </Container>
    );
  }

  const renderMobileView = () => (
    <Box sx={{ mt: 2 }}>
      {challans
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((challan: Challan) => (
          <Card key={challan.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="primary">
                  Challan #{challan.challanNumber}
                </Typography>
                <Chip
                  label={formatDate(challan.date)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Typography variant="body1" gutterBottom>
                {challan.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {challan.customerPhone}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Typography variant="subtitle1">Total Amount:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(challan.totalAmount)}
                </Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
              <IconButton
                onClick={() => handleEdit(challan)}
                color="primary"
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(challan.id)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      {challans.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No challans found. Create your first challan by clicking the "Create
            New Challan" button.
          </Typography>
        </Box>
      )}
      <TablePagination
        component="div"
        count={challans.length}
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
              <TableCell>Challan No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Supplier Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challans
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((challan: Challan) => (
                <TableRow key={challan.id} hover>
                  <TableCell>
                    <Typography variant="body1" color="primary">
                      #{challan.challanNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(challan.date)}</TableCell>
                  <TableCell>{challan.customerName || "-"}</TableCell>
                  <TableCell>{challan.customerPhone || "-"}</TableCell>

                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(challan.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, challan)}
                      color="primary"
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                onClick={() => {
                  if (menuChallan) handleView(menuChallan);
                  handleMenuClose();
                }}
              >
                View
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (menuChallan) handleEdit(menuChallan);
                  handleMenuClose();
                }}
              >
                Edit
              </MenuItem>
              {/* <MenuItem
                onClick={() => {
                  if (menuChallan) {
                    setPrintChallan(menuChallan);
                    setTimeout(() => {
                      downloadChallanPDF("challan-print");
                    }, 100); // Small delay to ensure component renders
                  }
                  handleMenuClose();
                }}
              >
                Print / Download
              </MenuItem> */}
              <MenuItem
                onClick={() => {
                  if (menuChallan) handleDelete(menuChallan.id);
                  handleMenuClose();
                }}
                sx={{ color: "error.main" }}
              >
                Delete
              </MenuItem>
            </Menu>

            {/* Here is challane view model  */}
            <Dialog
              open={viewDialogOpen}
              onClose={handleViewClose}
              maxWidth="sm"
              fullWidth
            >
              <Box p={3}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Challan Details
                </Typography>

                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <Stack width={{ xs: "100%", sm: "50%" }} mb={2}>
                    <Typography variant="subtitle2">Challan Number:</Typography>
                    <Typography variant="body1">
                      #{viewChallan?.challanNumber}
                    </Typography>
                  </Stack>
                  <Stack width={{ xs: "100%", sm: "50%" }} mb={2}>
                    <Typography variant="subtitle2">Date:</Typography>
                    <Typography variant="body1">
                      {viewChallan && formatDate(viewChallan.date)}
                    </Typography>
                  </Stack>
                  <Stack width={{ xs: "100%", sm: "50%" }} mb={2}>
                    <Typography variant="subtitle2">Customer Name:</Typography>
                    <Typography variant="body1">
                      {viewChallan?.customerName}
                    </Typography>
                  </Stack>
                  <Stack width={{ xs: "100%", sm: "50%" }} mb={2}>
                    <Typography variant="subtitle2">Phone:</Typography>
                    <Typography variant="body1">
                      {viewChallan?.customerPhone}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Products Table */}
                {viewChallan?.products && viewChallan.products.length > 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Product Details
                    </Typography>

                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Product Name</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Qty</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Rate</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Total</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {viewChallan.products.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell align="right">{p.quantity}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(p.price)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(p.price * p.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Divider sx={{ my: 2 }} />
                  </>
                )}

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="h6">
                    Total: {formatCurrency(viewChallan?.totalAmount || 0)}
                  </Typography>
                  <Button
                    onClick={handleViewClose}
                    variant="outlined"
                    color="primary"
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Dialog>

            {/* challan print */}
            {/* Hiden Pritn  */}
            {/* Hidden Print */}

            <div style={{ display: "none" }} id="challan-print">
              {printChallan && (
                <PrintableChallan challan={printChallan} company={company} />
              )}
            </div>
            {challans.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No challans found. Create your first challan by clicking
                      the "Create New Challan" button.
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
        count={challans.length}
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
            Challans
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
            Create New Challan
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            }
          >
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {error}
            </Typography>
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading challans...
            </Typography>
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
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <ChallanForm editChallan={selectedChallan} onClose={handleCloseForm} />
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

export default ChallanList;
