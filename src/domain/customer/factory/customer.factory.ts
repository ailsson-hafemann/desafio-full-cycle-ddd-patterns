import Customer from "../entity/customer";
import { v4 as uuid } from "uuid";
import Address from "../value-object/address";
import EventDispatcherInterface from "../../@shared/event/event-dispatcher.interface";
import CustomerCreatedEvent from "../event/customer-created.event";

export default class CustomerFactory {
  public static create(
    name: string,
    eventDispatcher?: EventDispatcherInterface
  ): Customer {
    const customer = new Customer(uuid(), name);
    CustomerFactory.notifyCreated(customer, eventDispatcher);
    return customer;
  }

  public static createWithAddress(
    name: string,
    address: Address,
    eventDispatcher?: EventDispatcherInterface
  ): Customer {
    const customer = new Customer(uuid(), name);
    customer.changeAddress(address);
    CustomerFactory.notifyCreated(customer, eventDispatcher);
    return customer;
  }

  private static notifyCreated(
    customer: Customer,
    eventDispatcher?: EventDispatcherInterface
  ): void {
    eventDispatcher?.notify(
      new CustomerCreatedEvent({ id: customer.id, name: customer.name })
    );
  }
}
