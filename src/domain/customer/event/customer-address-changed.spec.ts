import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import CustomerCreatedEvent from "./customer-created.event";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";

describe("Customer address changed domain event tests", () => {
  const newAddress = new Address("Street 2", 2, "13330-250", "São Paulo");
  const expectedMessage =
    "Endereço do cliente: 1, John alterado para: Street 2, 2, 13330-250 São Paulo";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should register the handler", () => {
    const eventDispatcher = new EventDispatcher();
    const handler = new EnviaConsoleLogHandler();

    eventDispatcher.register("CustomerAddressChangedEvent", handler);

    const handlers =
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"];
    expect(handlers.length).toBe(1);
    expect(handlers[0]).toBe(handler);
  });

  it("should unregister the handler", () => {
    const eventDispatcher = new EventDispatcher();
    const handler = new EnviaConsoleLogHandler();

    eventDispatcher.register("CustomerAddressChangedEvent", handler);
    eventDispatcher.unregister("CustomerAddressChangedEvent", handler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"].length
    ).toBe(0);
  });

  it("should carry id, name and new address in the event", () => {
    const event = new CustomerAddressChangedEvent({
      id: "1",
      name: "John",
      address: newAddress,
    });

    expect(event.eventData).toEqual({ id: "1", name: "John", address: newAddress });
    expect(event.dataTimeOccurred).toBeInstanceOf(Date);
  });

  it("should print the expected message in the handler", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    new EnviaConsoleLogHandler().handle(
      new CustomerAddressChangedEvent({ id: "1", name: "John", address: newAddress })
    );

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expectedMessage);
  });

  it("should notify the handler when CustomerAddressChangedEvent is notified", () => {
    const eventDispatcher = new EventDispatcher();
    const handler = new EnviaConsoleLogHandler();
    const spyHandler = jest.spyOn(handler, "handle").mockImplementation();
    eventDispatcher.register("CustomerAddressChangedEvent", handler);

    const event = new CustomerAddressChangedEvent({
      id: "1",
      name: "John",
      address: newAddress,
    });
    eventDispatcher.notify(event);

    expect(spyHandler).toHaveBeenCalledTimes(1);
    expect(spyHandler).toHaveBeenCalledWith(event);
  });

  it("should dispatch CustomerAddressChangedEvent when the address is changed", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.register("CustomerAddressChangedEvent", new EnviaConsoleLogHandler());
    const spyNotify = jest.spyOn(eventDispatcher, "notify");
    const customer = new Customer("1", "John");

    customer.changeAddress(newAddress, eventDispatcher);

    expect(customer.Address).toBe(newAddress);
    expect(spyNotify).toHaveBeenCalledTimes(1);
    const event = spyNotify.mock.calls[0][0] as CustomerAddressChangedEvent;
    expect(event).toBeInstanceOf(CustomerAddressChangedEvent);
    expect(event.eventData).toEqual({ id: "1", name: "John", address: newAddress });
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expectedMessage);
  });

  it("should dispatch the event on every address change with the latest address", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.register("CustomerAddressChangedEvent", new EnviaConsoleLogHandler());
    const customer = new Customer("1", "John");
    const firstAddress = new Address("Street 1", 1, "11111-111", "Rio");

    customer.changeAddress(firstAddress, eventDispatcher);
    customer.changeAddress(newAddress, eventDispatcher);

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      "Endereço do cliente: 1, John alterado para: Street 1, 1, 11111-111 Rio"
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(2, expectedMessage);
  });

  it("should not dispatch any event when no dispatcher is provided", () => {
    const eventDispatcher = new EventDispatcher();
    const spyNotify = jest.spyOn(eventDispatcher, "notify");
    const customer = new Customer("1", "John");

    customer.changeAddress(newAddress);

    expect(customer.Address).toBe(newAddress);
    expect(spyNotify).not.toHaveBeenCalled();
  });

  it("should not trigger the address changed handler on CustomerCreatedEvent", () => {
    const eventDispatcher = new EventDispatcher();
    const handler = new EnviaConsoleLogHandler();
    const spyHandler = jest.spyOn(handler, "handle").mockImplementation();
    eventDispatcher.register("CustomerAddressChangedEvent", handler);

    eventDispatcher.notify(new CustomerCreatedEvent({ id: "1", name: "John" }));

    expect(spyHandler).not.toHaveBeenCalled();
  });
});
