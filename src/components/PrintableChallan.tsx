// src/components/ChallanPrintable.tsx
import React from "react";

const ChallanPrintable = ({ challan, company }: any) => (
  <div style={{ padding: 32, fontFamily: "serif", width: 700, margin: "auto" }}>
    <h2 style={{ textAlign: "center" }}>{company?.name}</h2>
    <div style={{ textAlign: "center" }}>
      <div>{company?.address}</div>
      <div>GST: {company?.gst}</div>
      <div>Phone: {company?.phone}</div>
    </div>
    <hr />
    <h3 style={{ textAlign: "center" }}>Challan</h3>
    <div>
      <strong>Challan No:</strong> {challan.number} <br />
      <strong>Date:</strong> {challan.date}
    </div>
    <hr />
    {/* Add more challan details here */}
    <div>
      {/* Example: */}
      <strong>Items:</strong>
      <ul>
        {challan.items.map((item: any, idx: number) => (
          <li key={idx}>
            {item.name} - {item.qty} x {item.rate} = {item.amount}
          </li>
        ))}
      </ul>
    </div>
    <hr />
    <div style={{ textAlign: "right" }}>
      <strong>Total: {challan.total}</strong>
    </div>
  </div>
);

export default ChallanPrintable;
