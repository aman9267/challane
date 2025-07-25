import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setCompanyDetails, updateCompanyDetails } from '../../store/slices/companySlice';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';

interface CompanyDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
}

const CompanySettings: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { details } = useSelector((state: RootState) => state.company);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CompanyDetails>({
    name: details?.name || '',
    address: details?.address || '',
    phone: details?.phone || '',
    email: details?.email || '',
    gst: details?.gst || '',
  });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (user?.uid) {
        const docRef = doc(db, 'companies', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const companyData: CompanyDetails = {
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            gst: data.gst || '',
          };
          dispatch(setCompanyDetails(companyData));
          setFormData(companyData);
        }
      }
    };

    fetchCompanyDetails();
  }, [user?.uid, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'companies', user.uid), formData);
        dispatch(updateCompanyDetails(formData));
        setSuccess(true);
      } catch (error) {
        console.error('Error saving company details:', error);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Company Settings
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Company Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={3}
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Stack>
            <TextField
              fullWidth
              label="GST Number"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Paper>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Company details saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompanySettings; 