import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Challan } from "../store/slices/challanSlice";

interface DashboardStats {
  totalChallans: number;
  totalAmount: number;
  uniqueCustomers: number;
  averageAmount: number;
  recentChallans: Challan[];
  monthlyStats: {
    month: string;
    totalAmount: number;
    challanCount: number;
  }[];
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log("🔍 Fetching dashboard stats");

    // Get all challans
    const challansRef = collection(db, "challans");
    const q = query(
      challansRef,
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    const challans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Challan[];

    // Calculate basic stats
    const totalChallans = challans.length;
    const totalAmount = challans.reduce((sum, challan) => sum + challan.totalAmount, 0);
    const uniqueCustomers = new Set(challans.map(challan => challan.customerName)).size;
    const averageAmount = totalChallans > 0 ? totalAmount / totalChallans : 0;
    const recentChallans = challans.slice(0, 5);

    // Calculate monthly statistics
    const monthlyData: { [key: string]: any } = {};
    challans.forEach(challan => {
      const date = new Date(challan.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          totalAmount: 0,
          challanCount: 0,
        };
      }

      monthlyData[monthKey].totalAmount += challan.totalAmount;
      monthlyData[monthKey].challanCount += 1;
    });

    console.log("✅ Dashboard stats calculated");

    return {
      totalChallans,
      totalAmount,
      uniqueCustomers,
      averageAmount,
      recentChallans,
      monthlyStats: Object.values(monthlyData),
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
};

// Get dashboard stats for a date range
export const getDashboardStatsForDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<DashboardStats> => {
  try {
    console.log("🔍 Fetching dashboard stats for date range");

    // Get all challans
    const challansRef = collection(db, "challans");
    const q = query(
      challansRef,
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    const allChallans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Challan[];

    // Filter challans by date range
    const challans = allChallans.filter(challan => {
      const challanDate = new Date(challan.date);
      return challanDate >= startDate && challanDate <= endDate;
    });

    // Calculate stats
    const totalChallans = challans.length;
    const totalAmount = challans.reduce((sum, challan) => sum + challan.totalAmount, 0);
    const uniqueCustomers = new Set(challans.map(challan => challan.customerName)).size;
    const averageAmount = totalChallans > 0 ? totalAmount / totalChallans : 0;
    const recentChallans = challans.slice(0, 5);

    // Calculate monthly statistics
    const monthlyData: { [key: string]: any } = {};
    challans.forEach(challan => {
      const date = new Date(challan.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          totalAmount: 0,
          challanCount: 0,
        };
      }

      monthlyData[monthKey].totalAmount += challan.totalAmount;
      monthlyData[monthKey].challanCount += 1;
    });

    console.log("✅ Dashboard stats for date range calculated");

    return {
      totalChallans,
      totalAmount,
      uniqueCustomers,
      averageAmount,
      recentChallans,
      monthlyStats: Object.values(monthlyData),
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard stats for date range:", error);
    throw new Error("Failed to fetch dashboard statistics for date range");
  }
}; 