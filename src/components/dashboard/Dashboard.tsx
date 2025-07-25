import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Challan } from "../../store/slices/challanSlice";
import {
  getDashboardStats,
  getDashboardStatsForDateRange,
} from "../../api/dashboardService";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
  Divider,
  SvgIconProps,
  SxProps,
  Theme,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  ReceiptLong as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
  isLoading?: boolean;
}

interface MonthlyStats {
  month: string;
  totalAmount: number;
  challanCount: number;
}

interface DashboardData {
  totalChallans: number;
  totalAmount: number;
  uniqueCustomers: number;
  averageAmount: number;
  recentChallans: Challan[];
  monthlyStats: MonthlyStats[];
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalChallans: 0,
    totalAmount: 0,
    uniqueCustomers: 0,
    averageAmount: 0,
    recentChallans: [],
    monthlyStats: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        let data;
        if (timeFilter === "all") {
          data = await getDashboardStats();
          console.log("Dashboard data:", data);
        } else {
          const now = new Date();
          let startDate: Date;

          switch (timeFilter) {
            case "today":
              startDate = new Date(now.setHours(0, 0, 0, 0));
              break;
            case "week":
              startDate = new Date(now.setDate(now.getDate() - 7));
              break;
            case "month":
              startDate = new Date(now.setMonth(now.getMonth() - 1));
              break;
            default:
              startDate = new Date(0); // Beginning of time
          }

          data = await getDashboardStatsForDateRange(startDate, new Date());
        }

        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeFilter]);

  const handleTimeFilterChange = (event: SelectChangeEvent) => {
    setTimeFilter(event.target.value);
  };

  const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color,
    isLoading,
  }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: "12px",
              p: 1,
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            {React.cloneElement(icon, {
              sx: { color } as SxProps<Theme>,
              fontSize: "medium",
            })}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Typography variant="h4" sx={{ fontWeight: "medium" }}>
            {typeof value === "number" && title.toLowerCase().includes("amount")
              ? new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(value)
              : value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const RecentChallans = () => (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Recent Challans
      </Typography>
      <Divider sx={{ my: 2 }} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        dashboardData.recentChallans.map((challan) => (
          <Box
            key={challan.id}
            sx={{
              py: 1.5,
              "&:not(:last-child)": {
                borderBottom: 1,
                borderColor: "divider",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2">
                  #{challan.challanNumber} - {challan.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(challan.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="primary">
                ₹{challan.totalAmount.toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>
        ))
      )}
      {!loading && dashboardData.recentChallans.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center">
          No challans found for the selected period
        </Typography>
      )}
    </Paper>
  );

  const MonthlyStatistics = () => (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Monthly Statistics
      </Typography>
      <Divider sx={{ my: 2 }} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      ) : dashboardData.monthlyStats.length > 0 ? (
        dashboardData.monthlyStats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              py: 1.5,
              "&:not(:last-child)": {
                borderBottom: 1,
                borderColor: "divider",
              },
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle2">{stat.month}</Typography>
              <Typography variant="subtitle2" color="primary">
                ₹{stat.totalAmount.toLocaleString("en-IN")}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {stat.challanCount} challans
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" align="center">
          No monthly data available
        </Typography>
      )}
    </Paper>
  );

  // Show login message if not authenticated
  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Please log in to view the dashboard.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">Dashboard</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={timeFilter}
            label="Time Period"
            onChange={handleTimeFilterChange}
            size="small"
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Challans"
          value={dashboardData.totalChallans}
          icon={<ReceiptIcon />}
          color={theme.palette.primary.main}
          isLoading={loading}
        />
        <StatCard
          title="Total Amount"
          value={dashboardData.totalAmount}
          icon={<MoneyIcon />}
          color={theme.palette.success.main}
          isLoading={loading}
        />
        <StatCard
          title="Unique Customers"
          value={dashboardData.uniqueCustomers}
          icon={<PersonIcon />}
          color={theme.palette.info.main}
          isLoading={loading}
        />
        <StatCard
          title="Average Amount"
          value={dashboardData.averageAmount}
          icon={<TrendingUpIcon />}
          color={theme.palette.warning.main}
          isLoading={loading}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 3,
        }}
      >
        <RecentChallans />
        <MonthlyStatistics />
      </Box>
    </Box>
  );
};

export default Dashboard;
