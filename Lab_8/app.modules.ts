import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

// Root module: combines all feature modules
@Module({
  imports: [ProductsModule, CartModule, OrdersModule],
})
export class AppModule {}
