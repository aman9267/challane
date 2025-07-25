import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Supplier } from "../store/slices/supplierSlice";

// Get all suppliers
export const getSuppliers = async () => {
  try {
    const suppliersRef = collection(db, "suppliers");
    const q = query(suppliersRef, orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Supplier[];
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw new Error("Failed to fetch suppliers");
  }
};

export const addSupplier = async (
  supplierData: Omit<Supplier, "id">
): Promise<Supplier> => {
  console.log("Adding new supplier:", supplierData);

  try {
    const docRef = await addDoc(collection(db, "suppliers"), {
      name: supplierData.name,
      phone: supplierData.phone,
      address: supplierData.address,
      ...(supplierData.gst ? { gst: supplierData.gst } : {}),
    });

    return {
      id: docRef.id,
      ...supplierData,
    };
  } catch (error) {
    console.error("Error adding supplier:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add supplier"
    );
  }
};

// Update a supplier
export const updateSupplier = async (
  id: string,
  supplierData: Partial<Omit<Supplier, "id">>
) => {
  try {
    const supplierRef = doc(db, "suppliers", id);
    await updateDoc(supplierRef, supplierData);
    return {
      id,
      ...supplierData,
    } as Supplier;
  } catch (error) {
    console.error("Error updating supplier:", error);
    throw new Error("Failed to update supplier");
  }
};

// Delete a supplier
export const deleteSupplier = async (id: string) => {
  try {
    await deleteDoc(doc(db, "suppliers", id));
    return id;
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw new Error("Failed to delete supplier");
  }
};
