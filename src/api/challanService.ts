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
import { Challan } from "../store/slices/challanSlice";

// Get all challans
export const getChallans = async () => {
  try {
    console.log("🔍 Fetching challans");

    const challansRef = collection(db, "challans");
    const q = query(
      challansRef,
      orderBy("challanNumber", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("⚠️ No challans found");
      return [];
    }

    const challans = snapshot.docs.map((doc) => {
      const data = doc.data();
      const products = (data.products || []).map((product: any) => ({
        ...product,
        total: product.total || product.quantity * product.price,
      }));

      return {
        id: doc.id,
        ...data,
        products,
      } as Challan;
    });

    console.log(`✅ Found ${challans.length} challans`);
    return challans;
  } catch (error) {
    console.error("❌ Error fetching challans:", error);
    throw new Error("Failed to fetch challans");
  }
};

// Get challans for a date range
export const getChallansForDateRange = async (startDate: Date, endDate: Date) => {
  try {
    const challansRef = collection(db, "challans");
    const q = query(
      challansRef,
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    const challans = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((challan: any) => {
        const challanDate = new Date(challan.date);
        return challanDate >= startDate && challanDate <= endDate;
      }) as Challan[];

    return challans;
  } catch (error) {
    console.error("Error fetching challans for date range:", error);
    throw new Error("Failed to fetch challans for date range");
  }
};

// Add a new challan
export const addChallan = async (challanData: Omit<Challan, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "challans"), challanData);
    return {
      id: docRef.id,
      ...challanData,
    } as Challan;
  } catch (error) {
    console.error("Error adding challan:", error);
    throw new Error("Failed to add challan");
  }
};

// Update a challan
export const updateChallan = async (
  id: string,
  challanData: Partial<Challan>
) => {
  try {
    const challanRef = doc(db, "challans", id);
    
    // First get the existing challan
    const challanDoc = await getDoc(challanRef);
    if (!challanDoc.exists()) {
      throw new Error("Challan not found");
    }

    // Update only the provided fields
    await updateDoc(challanRef, challanData);

    // Return the complete updated challan
    return {
      id,
      ...challanDoc.data(),
      ...challanData,
    } as Challan;
  } catch (error) {
    console.error("Error updating challan:", error);
    throw new Error("Failed to update challan");
  }
};

// Delete a challan
export const deleteChallan = async (id: string) => {
  try {
    await deleteDoc(doc(db, "challans", id));
    return id;
  } catch (error) {
    console.error("Error deleting challan:", error);
    throw new Error("Failed to delete challan");
  }
};
