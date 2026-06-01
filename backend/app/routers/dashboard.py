from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import Product, Customer, Order, OrderItem
from app.schemas.schemas import DashboardStats

router = APIRouter()

LOW_STOCK_THRESHOLD = 10


@router.get("/", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    low_stock_count = db.query(Product).filter(Product.quantity <= LOW_STOCK_THRESHOLD).count()

    recent_orders = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).order_by(Order.created_at.desc()).limit(5).all()

    low_stock_items = db.query(Product).filter(
        Product.quantity <= LOW_STOCK_THRESHOLD
    ).order_by(Product.quantity.asc()).limit(10).all()

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_count,
        recent_orders=recent_orders,
        low_stock_items=low_stock_items
    )
