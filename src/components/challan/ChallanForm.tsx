import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import {
  addChallan as addChallanAction,
  updateChallan as updateChallanAction,
  Challan,
  ChallanState,
} from "../../store/slices/challanSlice";
import { addChallan, updateChallan } from "../../api/challanService";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";

interface Product {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ChallanFormProps {
  editChallan?: Challan;
  onClose?: () => void;
}

const ChallanForm: React.FC<ChallanFormProps> = ({ editChallan, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { lastChallanNumber } = useSelector(
    (state: RootState) => state.challan as ChallanState
  );
  const { details: companyDetails } = useSelector(
    (state: RootState) => state.company
  );

  const [formData, setFormData] = useState<Partial<Challan>>(
    editChallan || {
      challanNumber: lastChallanNumber + 1,
      date: new Date().toISOString().split("T")[0],
      products: [],
      totalAmount: 0,
      customerName: "",
      customerPhone: "",
    }
  );

  const [products, setProducts] = useState<Product[]>(
    editChallan?.products || []
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.customerName?.trim()) {
      errors.push("Customer name is required");
    }

    if (!formData.customerPhone?.trim()) {
      errors.push("Customer phone is required");
    } else if (!/^\d{10}$/.test(formData.customerPhone)) {
      errors.push("Invalid phone number format");
    }

    if (products.length === 0) {
      errors.push("At least one product is required");
    }

    products.forEach((product, index) => {
      if (!product.name.trim()) {
        errors.push(`Product name is required for item ${index + 1}`);
      }
      if (product.quantity <= 0) {
        errors.push(
          `Invalid quantity for ${product.name || `item ${index + 1}`}`
        );
      }
      if (product.price <= 0) {
        errors.push(`Invalid price for ${product.name || `item ${index + 1}`}`);
      }
    });

    return errors;
  };

  const handleProductChange = (
    index: number,
    field: keyof Product,
    value: string | number
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
      total:
        field === "price" || field === "quantity"
          ? Number(value) *
            (field === "price"
              ? products[index].quantity
              : products[index].price)
          : products[index].total,
    };
    setProducts(updatedProducts);
    calculateTotal(updatedProducts);
  };

  const calculateTotal = (currentProducts: Product[]) => {
    const total = currentProducts.reduce(
      (sum, product) => sum + product.total,
      0
    );
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  };

  const addProduct = () => {
    setProducts([...products, { name: "", quantity: 0, price: 0, total: 0 }]);
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    calculateTotal(updatedProducts);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    if (!user?.uid) {
      setError("Please log in to create challans");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editChallan?.id) {
        // Update existing challan
        const updateData = {
          date: formData.date || new Date().toISOString().split("T")[0],
          products: products.map(p => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            total: p.total
          })),
          totalAmount: formData.totalAmount || 0,
          customerName: formData.customerName || "",
          customerPhone: formData.customerPhone || "",
        };
        
        // Use the challan service to update
        await updateChallan(editChallan.id, updateData);
        dispatch(updateChallanAction({
          ...editChallan,
          ...updateData
        }));
      } else {
        // Create new challan
        const newChallanData = {
          userId: user.uid,
          challanNumber: formData.challanNumber || lastChallanNumber + 1,
          date: formData.date || new Date().toISOString().split("T")[0],
          products: products.map(p => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            total: p.total
          })),
          totalAmount: formData.totalAmount || 0,
          customerName: formData.customerName || "",
          customerPhone: formData.customerPhone || "",
        };
        
        // Use the challan service to add
        const newChallan = await addChallan(newChallanData);
        dispatch(addChallanAction({ ...newChallanData, id: newChallan.id }));
      }

      setSuccess(true);
      // Close the form after a short delay to show success message
      setTimeout(() => {
        setLoading(false);
        if (onClose) onClose();
        // Navigate to dashboard after creating/updating challan
        navigate('/');
      }, 1000);
    } catch (error: any) {
      console.error("Error saving challan:", error?.message || error);
      setError("Failed to save challan. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" color="primary">
            {editChallan ? "Edit Challan" : "New Challan"}
          </Typography>
          <Button
            startIcon={<PrintIcon />}
            variant="outlined"
            onClick={handlePrint}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            Print
          </Button>
        </Box>

        {companyDetails && (
          <Box sx={{ mb: 4, bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
            <Typography variant="h6" color="primary">
              {companyDetails.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {companyDetails.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: {companyDetails.phone}
            </Typography>
            {companyDetails.gst && (
              <Typography variant="body2" color="text.secondary">
                GST: {companyDetails.gst}
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Challan Number"
                value={formData.challanNumber}
                disabled
                size="small"
              />
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                onBlur={() => handleBlur("customerName")}
                error={touched.customerName && !formData.customerName?.trim()}
                helperText={
                  touched.customerName && !formData.customerName?.trim()
                    ? "Customer name is required"
                    : ""
                }
                size="small"
              />
              <TextField
                fullWidth
                label="Customer Phone"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                onBlur={() => handleBlur("customerPhone")}
                error={
                  touched.customerPhone &&
                  (!formData.customerPhone?.trim() ||
                    !/^\d{10}$/.test(formData.customerPhone))
                }
                helperText={
                  touched.customerPhone &&
                  (!formData.customerPhone?.trim()
                    ? "Phone number is required"
                    : !/^\d{10}$/.test(formData.customerPhone)
                    ? "Enter valid 10-digit number"
                    : "")
                }
                size="small"
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              mt: 4,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" color="primary">
              Products
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addProduct}
              variant="outlined"
              size="small"
            >
              Add Product
            </Button>
          </Box>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price (₹)</TableCell>
                  <TableCell align="right">Total (₹)</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange(index, "name", e.target.value)
                        }
                        placeholder="Enter product name"
                        error={
                          touched[`product-${index}`] && !product.name.trim()
                        }
                        onBlur={() => handleBlur(`product-${index}`)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        error={
                          touched[`quantity-${index}`] && product.quantity <= 0
                        }
                        onBlur={() => handleBlur(`quantity-${index}`)}
                        inputProps={{ min: 0, step: 1 }}
                        sx={{ width: "100px" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={product.price}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        error={touched[`price-${index}`] && product.price <= 0}
                        onBlur={() => handleBlur(`price-${index}`)}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ width: "100px" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        ₹{product.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => removeProduct(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No products added. Click "Add Product" to start.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "primary.light",
              color: "primary.contrastText",
              borderRadius: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h6">
              ₹{formData.totalAmount?.toFixed(2)}
            </Typography>
          </Box>

          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            {onClose && (
              <Button variant="outlined" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading
                ? "Saving..."
                : editChallan
                ? "Update Challan"
                : "Create Challan"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={1500}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Challan {editChallan ? "updated" : "created"} successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChallanForm;
