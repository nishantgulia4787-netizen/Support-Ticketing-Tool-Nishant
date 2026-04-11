package com.nexussupport.exception;
public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String ticketId) { super("Ticket not found with ID: " + ticketId); }
}
