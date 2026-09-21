import EnviaConsoleLog1Handler from "./handler/envia-console-log1.handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log2.handler";
import CustomerCreatedEvent from "./customer-created.event";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerFactory from "../factory/customer.factory";
import Address from "../value-object/address";

describe("Customer domain events tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should register the event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const handler1 = new EnviaConsoleLog1Handler();
    const handler2 = new EnviaConsoleLog2Handler();

    eventDispatcher.register("CustomerCreatedEvent", handler1);
    eventDispatcher.register("CustomerCreatedEvent", handler2);

    const handlers = eventDispatcher.getEventHandlers["CustomerCreatedEvent"];
    expect(handlers.length).toBe(2);
    expect(handlers[0]).toBe(handler1);
    expect(handlers[1]).toBe(handler2);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const handler1 = new EnviaConsoleLog1Handler();
    const handler2 = new EnviaConsoleLog2Handler();

    eventDispatcher.register("CustomerCreatedEvent", handler1);
    eventDispatcher.register("CustomerCreatedEvent", handler2);
    eventDispatcher.unregister("CustomerCreatedEvent", handler1);

    const handlers = eventDispatcher.getEventHandlers["CustomerCreatedEvent"];
    expect(handlers.length).toBe(1);
    expect(handlers[0]).toBe(handler2);
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog1Handler());
    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog2Handler());
    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify both handlers when CustomerCreatedEvent is notified", () => {
    const eventDispatcher = new EventDispatcher();
    const handler1 = new EnviaConsoleLog1Handler();
    const handler2 = new EnviaConsoleLog2Handler();
    const spyHandler1 = jest.spyOn(handler1, "handle");
    const spyHandler2 = jest.spyOn(handler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", handler1);
    eventDispatcher.register("CustomerCreatedEvent", handler2);

    const event = new CustomerCreatedEvent({ id: "1", name: "Customer 1" });
    eventDispatcher.notify(event);

    expect(spyHandler1).toHaveBeenCalledWith(event);
    expect(spyHandler2).toHaveBeenCalledWith(event);
  });

  it("should print the expected message in each handler", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const event = new CustomerCreatedEvent({ id: "1", name: "Customer 1" });

    new EnviaConsoleLog1Handler().handle(event);
    new EnviaConsoleLog2Handler().handle(event);

    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      "Esse é o primeiro console.log do evento: CustomerCreated"
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      "Esse é o segundo console.log do evento: CustomerCreated"
    );
  });

  it("should dispatch CustomerCreatedEvent when a customer is created", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog1Handler());
    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog2Handler());
    const spyNotify = jest.spyOn(eventDispatcher, "notify");

    const customer = CustomerFactory.create("John", eventDispatcher);

    expect(spyNotify).toHaveBeenCalledTimes(1);
    const event = spyNotify.mock.calls[0][0] as CustomerCreatedEvent;
    expect(event).toBeInstanceOf(CustomerCreatedEvent);
    expect(event.eventData).toEqual({ id: customer.id, name: "John" });
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      "Esse é o primeiro console.log do evento: CustomerCreated"
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      "Esse é o segundo console.log do evento: CustomerCreated"
    );
  });

  it("should dispatch CustomerCreatedEvent when a customer is created with address", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog1Handler());
    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog2Handler());
    const address = new Address("Street", 1, "13330-250", "São Paulo");

    CustomerFactory.createWithAddress("John", address, eventDispatcher);

    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });

  it("should not dispatch any event when the customer is invalid", () => {
    const eventDispatcher = new EventDispatcher();
    const spyNotify = jest.spyOn(eventDispatcher, "notify");

    expect(() => CustomerFactory.create("", eventDispatcher)).toThrow(
      "Name is required"
    );
    expect(spyNotify).not.toHaveBeenCalled();
  });
});
