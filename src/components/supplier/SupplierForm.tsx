import React, { useState } from "react";
import { Supplier } from "../../store/slices/supplierSlice";
import { addSupplier, updateSupplier } from "../../api/supplierService";
import {
  Box,
  TextField,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";

interface SupplierFormProps {
  editSupplier?: Supplier;
  onClose: () => void;
  onSuccess: (supplier: Supplier) => void;
}

interface FormData {
  name: string;
  phone: string;
  address: string;
  gst: string;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ editSupplier, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState<FormData>({
    name: editSupplier?.name || "",
    phone: editSupplier?.phone || "",
    address: editSupplier?.address || "",
    gst: editSupplier?.gst || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Name validation
    if (!formData.name.trim()) {
      errors.push("Name is required");
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.push("Phone number must be 10 digits");
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.push("Address is required");
    }

    // GST validation (optional)
    if (formData.gst.trim() && !/^[0-9A-Z]{15}$/.test(formData.gst.trim())) {
      errors.push("GST number must be 15 characters");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      phone: true,
      address: true,
      gst: true,
    });

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare supplier data
      const supplierData: {
        name: string;
        phone: string;
        address: string;
        gst?: string;
      } = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      // Add GST if provided
      if (formData.gst.trim()) {
        supplierData.gst = formData.gst.trim();
      }

      console.log("Submitting supplier data:", supplierData);

      let savedSupplier: Supplier;
      if (editSupplier) {
        // Update existing supplier
        savedSupplier = await updateSupplier(editSupplier.id, supplierData);
      } else {
        // Add new supplier
        savedSupplier = await addSupplier(supplierData);
      }

      console.log("Saved supplier:", savedSupplier);
      onSuccess(savedSupplier);
      onClose();
    } catch (error) {
      console.error("Error saving supplier:", error);
      setError(error instanceof Error ? error.message : "Failed to save supplier. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>
        {editSupplier ? "Edit Supplier" : "Add New Supplier"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="name"
              label="Supplier Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              error={Boolean(touched.name && !formData.name.trim())}
              helperText={touched.name && !formData.name.trim() ? "Name is required" : ""}
              required
              fullWidth
            />
            <TextField
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur("phone")}
              error={Boolean(touched.phone && (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())))}
              helperText={
                touched.phone && (
                  !formData.phone.trim() 
                    ? "Phone number is required" 
                    : !/^\d{10}$/.test(formData.phone.trim())
                    ? "Enter valid 10-digit number"
                    : ""
                )
              }
              required
              fullWidth
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              onBlur={() => handleBlur("address")}
              error={Boolean(touched.address && !formData.address.trim())}
              helperText={touched.address && !formData.address.trim() ? "Address is required" : ""}
              required
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              name="gst"
              label="GST Number (Optional)"
              value={formData.gst}
              onChange={handleChange}
              onBlur={() => handleBlur("gst")}
              error={Boolean(touched.gst && formData.gst.trim() && !/^[0-9A-Z]{15}$/.test(formData.gst.trim()))}
              helperText={
                touched.gst && formData.gst.trim() && !/^[0-9A-Z]{15}$/.test(formData.gst.trim())
                  ? "GST number must be 15 characters"
                  : "Optional"
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Saving..." : editSupplier ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default SupplierForm; 