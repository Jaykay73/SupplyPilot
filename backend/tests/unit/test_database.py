import pytest
from sqlalchemy.future import select
import backend.app.db.base  # Register all models in SQLAlchemy class registry
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.catalogue import Product, RawMaterial, ProductMaterial
from backend.app.models.orders import Order, Customer
from backend.app.models.suppliers import Supplier, SupplierMaterial, SupplierDelay
from backend.app.models.inventory import Inventory
from backend.app.models.users import User


@pytest.mark.asyncio
async def test_database_seed_integrity():
    async with AsyncSessionLocal() as session:
        # Check Products
        res = await session.execute(select(Product))
        products = res.scalars().all()
        assert len(products) == 10

        # Check Flagship Product
        res = await session.execute(select(Product).where(Product.sku == "PRD-001"))
        prd_001 = res.scalar_one_or_none()
        assert prd_001 is not None
        assert "Paracetamol" in prd_001.name

        # Check Raw Materials
        res = await session.execute(select(RawMaterial))
        materials = res.scalars().all()
        assert len(materials) == 20

        # Check Suppliers
        res = await session.execute(select(Supplier))
        suppliers = res.scalars().all()
        assert len(suppliers) == 8

        # Check Flagship Supplier Apex BioChem
        res = await session.execute(select(Supplier).where(Supplier.supplier_code == "SUP-001"))
        sup_001 = res.scalar_one_or_none()
        assert sup_001 is not None
        assert sup_001.overall_reliability_score >= 0.95

        # Check Orders count >= 100
        res = await session.execute(select(Order))
        orders = res.scalars().all()
        assert len(orders) >= 100

        # Check Flagship Order ORD-1847
        res = await session.execute(select(Order).where(Order.order_number == "ORD-1847"))
        ord_1847 = res.scalar_one_or_none()
        assert ord_1847 is not None
        assert ord_1847.total_amount == 62500.0

        # Check Finished Inventory for PRD-001
        res = await session.execute(select(Inventory).where(Inventory.product_id == prd_001.id))
        inv_prd = res.scalar_one_or_none()
        assert inv_prd is not None
        assert inv_prd.available == 3100.0

        # Check Raw Material Inventory for API-004
        res = await session.execute(select(RawMaterial).where(RawMaterial.material_code == "API-004"))
        api_004 = res.scalar_one_or_none()
        assert api_004 is not None
        res = await session.execute(select(Inventory).where(Inventory.material_id == api_004.id))
        inv_api = res.scalar_one_or_none()
        assert inv_api is not None
        assert inv_api.available == 800.0

        # Check Users
        res = await session.execute(select(User))
        users = res.unique().scalars().all()
        assert len(users) == 4
