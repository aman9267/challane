import React, { forwardRef } from "react";
import { Challan } from "../store/slices/challanSlice";

type Product = {
  name: string;
  quantity: number;
  price: number;
};

type PrintableChallanProps = {
  challan?: Challan;
};
const PrintableChallan = forwardRef<HTMLDivElement, PrintableChallanProps>(
  ({ challan }, ref) => {
    if (!challan) return null;

    return (
      <div
        ref={ref}
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          width: "100%",
          color: "#000",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Company Name</h2>
          <p>
            Address Line 1
            <br />
            Phone: 1234567890
          </p>
        </div>

        <hr style={{ border: "1px solid #000" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <div>
            <p>
              <strong>Challan No:</strong> {challan.challanNumber}
            </p>
            <p>
              <strong>Date:</strong> {challan.date}
            </p>
          </div>
          <div>
            <p>
              <strong>Customer:</strong> {challan.customerName}
            </p>
            <p>
              <strong>Phone:</strong> {challan.customerPhone}
            </p>
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th style={cellStyle}>S.No</th>
              <th style={cellStyle}>Product Name</th>
              <th style={cellStyle}>Qty</th>
              <th style={cellStyle}>Rate</th>
              <th style={cellStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.products.map((p, index) => (
              <tr key={index}>
                <td style={cellStyleCenter}>{index + 1}</td>
                <td style={cellStyleLeft}>{p.name}</td>
                <td style={cellStyleCenter}>{p.quantity}</td>
                <td style={cellStyleRight}>₹{p.price}</td>
                <td style={cellStyleRight}>₹{p.quantity * p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <h3>Total Amount: ₹{challan.totalAmount}</h3>
        </div>

        <div style={{ marginTop: "60px" }}>
          <p>
            <strong>Signature:</strong> ____________________
          </p>
        </div>
      </div>
    );
  }
);

export default PrintableChallan;

// Common style constants
const cellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "8px",
  textAlign: "center",
};

const cellStyleCenter: React.CSSProperties = {
  ...cellStyle,
  textAlign: "center",
};

const cellStyleLeft: React.CSSProperties = {
  ...cellStyle,
  textAlign: "left",
};

const cellStyleRight: React.CSSProperties = {
  ...cellStyle,
  textAlign: "right",
};
