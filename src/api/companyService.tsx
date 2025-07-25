// src/api/companyService.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export const getCompanyDetails = async () => {
  try {
    const companyRef = collection(db, "companydetails");
    const snapshot = await getDocs(companyRef);
    // Assuming only one company detail document
    return snapshot.docs[0]?.data() || null;
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw new Error("Failed to fetch company details");
  }
};