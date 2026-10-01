# Inventory Management & Safety Stock Policy (POL-INV-005)

**Department:** Supply Chain Logistics  
**Effective Date:** 2026-01-15  
**Category:** Inventory Standards  

## 1. Safety Stock Maintenance
All high-velocity active raw materials and finished products must maintain safety stock calculated as:
$$\text{Safety Stock} = \text{Average Daily Demand} \times \text{Lead Time} \times 1.5$$

- API-004 (Paracetamol Pure Grade) minimum safety stock is established at 500.0 kg.
- Finished Goods PRD-001 (Paracetamol IV Solution) minimum safety stock is established at 1,000 units.

## 2. Inventory Availability Definition
The operational system must distinguish between:
- **On-Hand Inventory:** Physical units physically located within warehouse bins.
- **Reserved Inventory:** Stock committed to approved customer orders or active production lots.
- **Available Inventory:** $\text{Available} = \max(0, \text{On-Hand} - \text{Reserved})$.
- **Incoming Inventory:** Purchased material confirmed in transit by suppliers.
The AI agent must never treat On-Hand stock as Available without subtracting existing commitments.
