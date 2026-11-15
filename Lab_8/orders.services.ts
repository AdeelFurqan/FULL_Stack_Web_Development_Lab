import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  private orders: any[] = [];
  private nextId = 1;

  constructor(
    private cartService: CartService,
    private productsService: ProductsService,
  ) {}

  // Place an order from the current cart
  checkout() {
    const cart = this.cartService.getCart();

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Reduce stock for each purchased item
    for (const item of cart.items) {
      const product = this.productsService.findOne(item.productId);
      this.productsService.update(item.productId, {
        stock: product.stock - item.quantity,
      });
    }

    const order = {
      id: this.nextId++,
      items: [...cart.items],
      total: cart.total,
      date: new Date(),
    };
    this.orders.push(order);

    this.cartService.clearCart();
    return order;
  }

  // Get all orders
  findAll() {
    return this.orders;
  }

  // Get one order
  findOne(id: number) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
