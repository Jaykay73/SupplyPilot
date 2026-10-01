import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy.future import select
from backend.app.core.config import settings
from backend.app.core.security import get_password_hash
from backend.app.db.session import AsyncSessionLocal, engine, Base
from backend.app.models.users import User, Role
from backend.app.models.catalogue import Product, RawMaterial, ProductMaterial
from backend.app.models.orders import Customer, Order, OrderItem
from backend.app.models.inventory import Inventory, InventoryReservation
from backend.app.models.suppliers import Supplier, SupplierMaterial, SupplierDelay
from backend.app.models.production import ProductionBatch, ProductionLine, ProductionSchedule
from backend.app.models.actions import PurchaseRequest
from backend.app.models.approvals import ApprovalRequest
from backend.app.models.audit import AuditEvent, UserMemory


async def seed_database():
    """Seeds the database with deterministic, reproducible synthetic pharmaceutical data."""
    print("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("Seeding Roles and Users...")
        # 1. Roles
        roles_data = [
            ("procurement_officer", "Can create procurement requests and approve up to EUR 25,000"),
            ("production_planner", "Can reschedule production batches and manage line capacity"),
            ("operations_manager", "Can approve high-value requests, cancellations, and customer comms"),
            ("admin", "Full platform administrative privileges"),
        ]
        role_objs = {}
        for name, desc in roles_data:
            role = Role(name=name, description=desc)
            session.add(role)
            role_objs[name] = role
        await session.flush()

        # 2. Users
        users_data = [
            ("procurement@demo.local", "John Vance", "Procurement", ["procurement_officer"]),
            ("planner@demo.local", "Elena Rostova", "Planning", ["production_planner"]),
            ("manager@demo.local", "Marcus Sterling", "Operations", ["operations_manager"]),
            ("admin@demo.local", "Dr. Sarah Chen", "Executive", ["admin", "operations_manager"]),
        ]
        user_objs = {}
        for email, name, dept, u_roles in users_data:
            user = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash("demo123"),
                department=dept,
            )
            for r in u_roles:
                user.roles.append(role_objs[r])
            session.add(user)
            user_objs[email] = user
        await session.flush()

        print("Seeding Products and Raw Materials...")
        # 3. Finished Products (10 products)
        products_info = [
            ("PRD-001", "Paracetamol IV Solution 10mg/ml", "Sterile Injectable", "vials", 24.0, 1000, 5000, 12.50),
            ("PRD-002", "Amoxicillin-Clavulanate 625mg Tablets", "Solid Oral", "tablets", 18.0, 2500, 10000, 8.40),
            ("PRD-003", "Ciprofloxacin 500mg Film Tablets", "Solid Oral", "tablets", 16.0, 1500, 8000, 9.80),
            ("PRD-004", "Metformin HCl 850mg ER Tablets", "Solid Oral", "tablets", 20.0, 3000, 12000, 6.20),
            ("PRD-005", "Ceftriaxone 1g Powder for Injection", "Sterile Injectable", "vials", 30.0, 800, 4000, 18.90),
            ("PRD-006", "Ibuprofen 400mg Soft Gel Capsules", "Solid Oral", "capsules", 14.0, 2000, 15000, 5.50),
            ("PRD-007", "Omeprazole 40mg Delayed-Release", "Solid Oral", "capsules", 22.0, 1200, 6000, 14.20),
            ("PRD-008", "Atorvastatin 20mg Film Tablets", "Solid Oral", "tablets", 15.0, 1800, 9000, 11.00),
            ("PRD-009", "Azithromycin 500mg Dihydrate", "Solid Oral", "capsules", 19.0, 900, 5000, 16.50),
            ("PRD-010", "Salbutamol Inhalation 5mg/ml", "Liquid Inhalation", "bottles", 12.0, 1100, 4500, 7.80),
        ]
        prod_objs = {}
        for sku, name, cat, unit, prod_time, safety, batch_sz, price in products_info:
            p = Product(
                sku=sku,
                name=name,
                category=cat,
                unit=unit,
                production_time_hours=prod_time,
                safety_stock=safety,
                standard_batch_size=batch_sz,
                unit_price=price,
            )
            session.add(p)
            prod_objs[sku] = p
        await session.flush()

        # 4. Raw Materials (20 materials)
        raw_mat_info = [
            ("API-001", "Amoxicillin Trihydrate USP", "API", "kg", 800.0, 32.0),
            ("API-002", "Potassium Clavulanate Diluted", "API", "kg", 300.0, 75.0),
            ("API-003", "Ciprofloxacin Hydrochloride EP", "API", "kg", 600.0, 45.0),
            ("API-004", "Paracetamol Pure Pharma Grade", "API", "kg", 1200.0, 5.60),  # Flagship
            ("API-005", "Metformin Hydrochloride USP", "API", "kg", 1500.0, 4.20),
            ("API-006", "Ceftriaxone Sodium Sterile", "API", "kg", 400.0, 95.0),
            ("API-007", "Ibuprofen EP/USP Grade", "API", "kg", 1000.0, 8.50),
            ("API-008", "Omeprazole Magnesium BP", "API", "kg", 500.0, 62.0),
            ("API-009", "Atorvastatin Calcium Trihydrate", "API", "kg", 350.0, 110.0),
            ("API-010", "Azithromycin Dihydrate", "API", "kg", 450.0, 85.0),
            ("EXC-001", "Microcrystalline Cellulose PH-102", "Excipient", "kg", 2000.0, 3.80),
            ("EXC-002", "Magnesium Stearate NF", "Excipient", "kg", 500.0, 6.20),
            ("EXC-003", "Povidone K30 (PVP)", "Excipient", "kg", 600.0, 7.50),
            ("EXC-004", "Lactose Monohydrate Pharma", "Excipient", "kg", 1800.0, 2.90),
            ("SOL-001", "Water for Injection (WFI) Bulk", "Solvent", "liters", 10000.0, 0.40),
            ("PKG-001", "Borosilicate Type-I Glass Vials 50ml", "Packaging", "units", 15000.0, 0.45),
            ("PKG-002", "Chlorobutyl Elastomeric Stoppers 20mm", "Packaging", "units", 20000.0, 0.15),
            ("PKG-003", "Aluminum Crimp Flip-Off Seals 20mm", "Packaging", "units", 20000.0, 0.08),
            ("PKG-004", "High-Barrier Alu-Alu Blister Foil", "Packaging", "meters", 5000.0, 1.20),
            ("PKG-005", "Medical Grade HDPE Bottles 100ml", "Packaging", "units", 8000.0, 0.35),
        ]
        mat_objs = {}
        for code, name, cat, unit, safety, cost in raw_mat_info:
            m = RawMaterial(
                material_code=code,
                name=name,
                category=cat,
                unit=unit,
                safety_stock=safety,
                standard_cost_per_unit=cost,
            )
            session.add(m)
            mat_objs[code] = m
        await session.flush()

        # 5. Bill of Materials (ProductMaterial)
        # PRD-001 Paracetamol IV (per vial: 0.3 kg API-004, 0.05 L SOL-001, 1 vial PKG-001, 1 stopper PKG-002, 1 seal PKG-003)
        bom_rules = [
            ("PRD-001", "API-004", 0.30),
            ("PRD-001", "SOL-001", 0.05),
            ("PRD-001", "PKG-001", 1.0),
            ("PRD-001", "PKG-002", 1.0),
            ("PRD-001", "PKG-003", 1.0),
            # PRD-002 Amoxicillin-Clav (per 1000 tablets: 0.5 kg API-001, 0.125 kg API-002, 0.3 kg EXC-001)
            ("PRD-002", "API-001", 0.0005),
            ("PRD-002", "API-002", 0.000125),
            ("PRD-002", "EXC-001", 0.0003),
            # PRD-003 Ciprofloxacin
            ("PRD-003", "API-003", 0.0005),
            ("PRD-003", "EXC-001", 0.0002),
            ("PRD-003", "EXC-002", 0.00005),
        ]
        for p_sku, m_code, qty_per in bom_rules:
            bm = ProductMaterial(
                product_id=prod_objs[p_sku].id,
                material_id=mat_objs[m_code].id,
                quantity_required_per_unit=qty_per,
            )
            session.add(bm)
        await session.flush()

        print("Seeding Suppliers and Supplier Materials...")
        # 6. Suppliers (8 qualified pharma suppliers)
        suppliers_info = [
            ("SUP-001", "Apex BioChem GmbH", "DE", 0.96, "ACTIVE", "orders@apexbio.de"),
            ("SUP-002", "BioSynth Europe BV", "NL", 0.94, "ACTIVE", "supply@biosynth.nl"),
            ("SUP-003", "ChemVanguard AG", "CH", 0.98, "ACTIVE", "logistics@chemvanguard.ch"),
            ("SUP-004", "MedChem Solutions SpA", "IT", 0.89, "ACTIVE", "commercial@medchem.it"),
            ("SUP-005", "Nordic Pharma Materials", "SE", 0.95, "ACTIVE", "nordic@pharmamats.se"),
            ("SUP-006", "Iberia Chemical Synthetics", "ES", 0.88, "ACTIVE", "contact@iberiachem.es"),
            ("SUP-007", "Rhine Packaging Solutions", "DE", 0.97, "ACTIVE", "sales@rhinepack.de"),
            ("SUP-008", "PharmaVials Packaging SAS", "FR", 0.93, "ACTIVE", "contact@pharmavials.fr"),
        ]
        sup_objs = {}
        for code, name, country, rel, status, email in suppliers_info:
            s = Supplier(
                supplier_code=code,
                name=name,
                country=country,
                overall_reliability_score=rel,
                status=status,
                contact_email=email,
            )
            session.add(s)
            sup_objs[code] = s
        await session.flush()

        # 7. Supplier Materials (Relationships, qualification, lead time, pricing)
        # Note: SUP-001 is Primary for API-004 (5 days lead time, 5.60 EUR/kg)
        # SUP-004 is Alternative for API-004 (6 days lead time, 5.95 EUR/kg)
        # SUP-002 is NOT approved for API-004 (Policy test!)
        sup_mat_links = [
            ("SUP-001", "API-004", 5.60, 5, 500.0, 10000.0, "QUALIFIED", True),
            ("SUP-004", "API-004", 5.95, 6, 200.0, 8000.0, "QUALIFIED", True),
            ("SUP-002", "API-004", 5.10, 8, 1000.0, 5000.0, "RESTRICTED", False),  # Explicitly unapproved by policy
            ("SUP-001", "API-001", 32.0, 7, 100.0, 4000.0, "QUALIFIED", True),
            ("SUP-003", "API-001", 34.5, 5, 200.0, 6000.0, "QUALIFIED", True),
            ("SUP-002", "API-002", 75.0, 9, 50.0, 2000.0, "QUALIFIED", True),
            ("SUP-003", "API-003", 45.0, 6, 100.0, 3000.0, "QUALIFIED", True),
            ("SUP-005", "API-003", 46.5, 4, 150.0, 4000.0, "QUALIFIED", True),
            ("SUP-007", "PKG-001", 0.45, 5, 5000.0, 50000.0, "QUALIFIED", True),
            ("SUP-008", "PKG-001", 0.48, 4, 2000.0, 40000.0, "QUALIFIED", True),
            ("SUP-007", "PKG-002", 0.15, 5, 10000.0, 60000.0, "QUALIFIED", True),
            ("SUP-007", "PKG-003", 0.08, 4, 10000.0, 60000.0, "QUALIFIED", True),
        ]
        for sup_code, mat_code, price, lt, moq, cap, qual, appr in sup_mat_links:
            sm = SupplierMaterial(
                supplier_id=sup_objs[sup_code].id,
                material_id=mat_objs[mat_code].id,
                unit_price=price,
                lead_time_days=lt,
                minimum_order_quantity=moq,
                weekly_capacity=cap,
                qualification_status=qual,
                is_approved=appr,
            )
            session.add(sm)
        await session.flush()

        print("Seeding Inventory...")
        # 8. Inventory Setup
        # Finished Product Inventory: PRD-001 has 3,100 on_hand, 0 reserved -> available = 3,100 (Medix needs 5,000!)
        inv_data = [
            ("product", "PRD-001", 3100.0, 0.0, 0.0, "vials"),
            ("product", "PRD-002", 12000.0, 2000.0, 0.0, "tablets"),
            ("product", "PRD-003", 7500.0, 1000.0, 0.0, "tablets"),
            ("product", "PRD-004", 15000.0, 500.0, 0.0, "tablets"),
            ("product", "PRD-005", 2500.0, 0.0, 0.0, "vials"),
            # Raw Material Inventory: API-004 has 800 kg on_hand, 0 reserved -> Shortage of 700 kg for 5,000 unit batch!
            ("material", "API-004", 800.0, 0.0, 0.0, "kg"),
            ("material", "API-001", 1200.0, 200.0, 0.0, "kg"),
            ("material", "API-002", 450.0, 50.0, 0.0, "kg"),
            ("material", "API-003", 900.0, 100.0, 0.0, "kg"),
            ("material", "PKG-001", 25000.0, 0.0, 0.0, "units"),
            ("material", "PKG-002", 30000.0, 0.0, 0.0, "units"),
            ("material", "PKG-003", 30000.0, 0.0, 0.0, "units"),
            ("material", "SOL-001", 15000.0, 0.0, 0.0, "liters"),
        ]
        for itype, code, on_hand, reserved, incoming, unit in inv_data:
            inv = Inventory(
                product_id=prod_objs[code].id if itype == "product" else None,
                material_id=mat_objs[code].id if itype == "material" else None,
                on_hand=on_hand,
                reserved=reserved,
                incoming=incoming,
                unit=unit,
                warehouse_location="WH-MAIN-CENTRAL",
            )
            session.add(inv)
        await session.flush()

        print("Seeding Production Lines & Batches...")
        # 9. Production Lines & Batches
        line1 = ProductionLine(
            line_code="LINE-1-STERILE",
            name="Sterile Vial Filling Line 1",
            category="Sterile Injectable",
            daily_capacity_hours=16.0,
            efficiency_factor=0.92,
        )
        line2 = ProductionLine(
            line_code="LINE-2-TABLETS",
            name="High-Speed Tableting Line 2",
            category="Solid Oral",
            daily_capacity_hours=16.0,
            efficiency_factor=0.95,
        )
        session.add(line1)
        session.add(line2)
        await session.flush()

        # Batch for Medix fulfillment: BATCH-2026-104 scheduled for Oct 12, 2026
        ref_date = datetime.strptime(settings.DEMO_DATE, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        batch_medix = ProductionBatch(
            batch_number="BATCH-2026-104",
            product_id=prod_objs["PRD-001"].id,
            target_quantity=5000,
            status="SCHEDULED",
            scheduled_start_date=ref_date + timedelta(days=11),  # Oct 12, 2026
            scheduled_end_date=ref_date + timedelta(days=12),    # Oct 13, 2026
            line_id=line1.line_code,
            block_reason=None,
        )
        session.add(batch_medix)
        await session.flush()

        # Schedule slot
        pslot = ProductionSchedule(
            line_code=line1.line_code,
            scheduled_date=ref_date + timedelta(days=11),
            hours_allocated=14.0,
            batch_id=batch_medix.id,
            notes="Medix Paracetamol 5000 vials batch",
        )
        session.add(pslot)

        print("Seeding Customers & Orders...")
        # 10. Customers (30 customers)
        customers_list = [
            ("CUST-001", "Medix Global Logistics", "DE", "Tier-1", "procurement@medix-logistics.de"),
            ("CUST-002", "Charité University Hospital", "DE", "Tier-1", "supply@charite.de"),
            ("CUST-003", "EuroHealth Pharmacy Wholesale", "FR", "Tier-2", "orders@eurohealth.fr"),
            ("CUST-004", "NordCare Health Authority", "SE", "Tier-1", "purchasing@nordcare.se"),
            ("CUST-005", "St. Antonius Hospital Group", "NL", "Tier-2", "pharmacy@stantonius.nl"),
            ("CUST-006", "Alpine Clinical Alliance", "CH", "Tier-1", "orders@alpineclinical.ch"),
            ("CUST-007", "Iberian MedSupply SA", "ES", "Tier-2", "supply@iberianmed.es"),
            ("CUST-008", "Benelux Pharma Distribution", "BE", "Tier-2", "orders@beneluxpharma.be"),
            ("CUST-009", "Vienna Central Clinical Hub", "AT", "Tier-1", "med@viennaclinical.at"),
            ("CUST-010", "NHS Regional Trust 4", "GB", "Tier-1", "pharmacy@nhstrust4.nhs.uk"),
        ]
        # Generate 20 more realistic customers
        for i in range(11, 31):
            customers_list.append((
                f"CUST-{i:03d}",
                f"Pharma Distribution Group {i}",
                "DE" if i % 2 == 0 else "FR",
                "Tier-2" if i % 3 == 0 else "Tier-1",
                f"orders@distributor{i}.eu",
            ))

        cust_objs = {}
        for c_code, name, country, tier, email in customers_list:
            c = Customer(
                customer_code=c_code,
                name=name,
                country=country,
                tier=tier,
                contact_email=email,
            )
            session.add(c)
            cust_objs[c_code] = c
        await session.flush()

        # 11. Orders (Flagship order + 120 synthetic orders)
        # Flagship Order: ORD-1847 for Medix
        order_medix = Order(
            order_number="ORD-1847",
            customer_id=cust_objs["CUST-001"].id,
            order_date=ref_date - timedelta(days=6),  # Sep 25, 2026
            requested_delivery_date=ref_date + timedelta(days=19),  # Oct 20, 2026
            status="at_risk",
            priority="HIGH",
            currency="EUR",
            total_amount=62500.0,
            risk_level="HIGH",
            risk_reason="Raw material API-004 inventory shortage (800 kg available vs 1,500 kg needed)",
        )
        session.add(order_medix)
        await session.flush()

        item_medix = OrderItem(
            order_id=order_medix.id,
            product_id=prod_objs["PRD-001"].id,
            quantity=5000,
            unit_price=12.50,
            fulfilled_quantity=0,
        )
        session.add(item_medix)

        # Flagship Secondary Order: ORD-1842
        order_1842 = Order(
            order_number="ORD-1842",
            customer_id=cust_objs["CUST-002"].id,
            order_date=ref_date - timedelta(days=8),
            requested_delivery_date=ref_date + timedelta(days=14),  # Oct 15, 2026
            status="at_risk",
            priority="CRITICAL",
            currency="EUR",
            total_amount=37800.0,
            risk_level="HIGH",
            risk_reason="Production batch dependent on delayed supplier delivery",
        )
        session.add(order_1842)
        await session.flush()

        item_1842 = OrderItem(
            order_id=order_1842.id,
            product_id=prod_objs["PRD-003"].id,
            quantity=4000,
            unit_price=9.45,
            fulfilled_quantity=0,
        )
        session.add(item_1842)

        # Generate ~115 more orders to reach ~120 total orders
        statuses = ["confirmed", "confirmed", "in_production", "fulfilled", "confirmed", "at_risk"]
        for idx in range(1, 116):
            ord_num = f"ORD-{2000 + idx}"
            cust_key = f"CUST-{((idx % 30) + 1):03d}"
            p_sku = f"PRD-{((idx % 10) + 1):03d}"
            st = statuses[idx % len(statuses)]
            r_level = "HIGH" if st == "at_risk" else ("MEDIUM" if st == "in_production" else "LOW")
            qty = 1000 + (idx * 50) % 5000
            unit_p = prod_objs[p_sku].unit_price
            tot = qty * unit_p

            ord_obj = Order(
                order_number=ord_num,
                customer_id=cust_objs[cust_key].id,
                order_date=ref_date - timedelta(days=(idx % 20)),
                requested_delivery_date=ref_date + timedelta(days=((idx % 25) + 3)),
                status=st,
                priority="URGENT" if idx % 10 == 0 else ("HIGH" if idx % 4 == 0 else "NORMAL"),
                currency="EUR",
                total_amount=tot,
                risk_level=r_level,
                risk_reason="Component lead time tight" if r_level == "HIGH" else None,
            )
            session.add(ord_obj)
            await session.flush()

            o_item = OrderItem(
                order_id=ord_obj.id,
                product_id=prod_objs[p_sku].id,
                quantity=qty,
                unit_price=unit_p,
                fulfilled_quantity=qty if st == "fulfilled" else 0,
            )
            session.add(o_item)

        print("Seeding Flagship Supplier Delay...")
        # 12. Supplier Delay (Flagship Scenario)
        # Apex BioChem delayed API-004 by 5 days (from Oct 05 to Oct 10)
        delay_event = SupplierDelay(
            delay_code="DELAY-2026-001",
            supplier_id=sup_objs["SUP-001"].id,
            material_id=mat_objs["API-004"].id,
            delay_days=5,
            original_eta=ref_date + timedelta(days=4),   # Oct 5, 2026
            revised_eta=ref_date + timedelta(days=9),    # Oct 10, 2026
            reason="Centrifuge crystallization maintenance downtime at Frankfurt synthesis plant",
            status="REPORTED",
        )
        session.add(delay_event)

        print("Seeding Initial Audit & Memory...")
        # 13. Audit Entry & User Memory
        audit_init = AuditEvent(
            actor_id="SYSTEM",
            actor_name="SupplyPilot Seeder",
            actor_role="admin",
            action="SYSTEM_INITIALIZATION",
            target_type="database",
            target_id="all",
            reason="Initialized deterministic synthetic environment for PharmaPulse Operations",
            status="COMPLETED",
            details={"demo_date": settings.DEMO_DATE, "version": "0.1.0"},
        )
        session.add(audit_init)

        mem_procurement = UserMemory(
            user_id=user_objs["procurement@demo.local"].id,
            preference_key="default_supplier",
            preference_value="SUP-001",
        )
        mem_units = UserMemory(
            user_id=user_objs["procurement@demo.local"].id,
            preference_key="measurement_system",
            preference_value="metric",
        )
        session.add(mem_procurement)
        session.add(mem_units)

        await session.commit()
        print("Successfully seeded all database tables with reproducible data!")


if __name__ == "__main__":
    asyncio.run(seed_database())
