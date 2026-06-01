from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: float
    quantity: int

    @field_validator('price')
    @classmethod
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Price must be non-negative')
        return v

    @field_validator('quantity')
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('Quantity must be non-negative')
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None


class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator('quantity')
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be positive')
        return v


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product: Optional[Product] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None

    @field_validator('items')
    @classmethod
    def items_must_not_be_empty(cls, v):
        if not v:
            raise ValueError('Order must have at least one item')
        return v


class Order(BaseModel):
    id: int
    customer_id: int
    status: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    customer: Optional[Customer] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# Dashboard Schema
class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
    recent_orders: List[Order] = []
    low_stock_items: List[Product] = []
