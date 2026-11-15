import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders') // base route: /orders
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout') // POST /orders/checkout
  checkout() {
    return this.ordersService.checkout();
  }

  @Get() // GET /orders
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id') // GET /orders/1
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }
}
